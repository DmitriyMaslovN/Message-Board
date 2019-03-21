const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcrypt'); // for heshing password
const saltRounds = 12; // reliable protect
let db;
MongoClient.connect(process.env.DB, (err, database)=>{
  if(err){
    console.log(err);
  }else{
    console.log('Successful database connected')
    db = database;
  }
})

function Reply(){
  this.postReply = (req, res)=>{
    let date = new Date().toUTCString();
    let repId = new ObjectID();
    let paramsBoard = req.params.board; 
    bcrypt.hash(req.body.delete_password, saltRounds)
          .then((hash)=>{
      db.collection('boardDb')
        .findOneAndUpdate({board: paramsBoard},
                           {$set:{
                             bumped_on: date // update date
                           }, 
                            $push:{// push in empty array data
                              replies:{
                                _id: repId, 
                                text: req.body.text,
                                created_on: date,
                                delete_password: hash, // new password reply
                                reported: false
                              }
                            }
                           },
                          (err, data)=>{
        if(err) console.log(err);
        res.redirect('/b/'+ paramsBoard + '/' + repId); // redirect /b/:board to show getReply data without reported.....
      })
    })
  }
  
  this.getReply = (req, res) =>{
    console.log(req.query)
    db.collection('boardDb')
      .findOne({board: req.params.board},
               {'reported': 0,
                'delete_password': 0,
                'replies.reported': 0,
                'replies.delete_password': 0
               },
               (err, data) =>{
      if(err) console.log(err);
      res.json(data)
    })
  }
  
  this.putReply = (req, res) => {
    db.collection('boardDb')
      .findOneAndUpdate({_id: new ObjectID(req.body.thread_id),
                         replies:{
                           $elemMatch:{
                             _id:new ObjectID(req.body.reply_id)
                           }
                         }
                        },
                        {$set:{"replies.$.reported": true}}, // set new bool. in reported: replies: [{},{reported: true},{}]
                       (err, data)=>{
      if(err) console.log(err);
      res.send('success');
    })
  }
  
  this.deleteReply = (req, res) =>{
    let id = req.body.thread_id;
    let password = req.body.delete_password; // reply password
    let repId = req.body.reply_id;
     console.log(req.body)
      db.collection('boardDb')
        .findOne({_id: new ObjectID(id),
                  replies:{
                    $elemMatch:{
                      _id: new ObjectID(repId)
                    }
                  }
                 },
                (err, data) =>{
        if(err) console.log(err)
        let match = bcrypt.compareSync(password, data.replies[0].delete_password); // compare reply password
        if(match){ // if correct, password = true
          db.collection('boardDb')
            .findOneAndUpdate({_id: new ObjectID(id),
                               replies:{
                                 $elemMatch:{
                                   _id: new ObjectID(repId)
                                  }
                                }
                               },
                              {$set:{
                                   "replies.$.text": '[deleted]'} // only change text to deleted
                               },
                              (err, docs)=>{
            if(err) console.log(err);
            res.send('success');
          })
        }else{
          res.send('incorrect password');
        }
      })
  }
}

module.exports = Reply;
