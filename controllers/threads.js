const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcrypt'); // for heshing password
const saltRounds = 12;
let db;
MongoClient.connect(process.env.DB, (err, database)=>{
  if(err){
    console.log(err);
  }else{
    console.log('Successful database connected')
    db = database;
  }
})

function Thread(){
  
  this.postThread = (req, res) =>{
    let date = new Date().toUTCString();
    let board = req.params.board;
    bcrypt.hash(req.body.delete_password, saltRounds) // async hash password
          .then((hash)=>{
      db.collection('boardDb')
        .insertOne({ board: board,
                     text: req.body.text,
                     created_on: date,
                     bumped_on: date,
                     reported: false,
                     delete_password: hash,
                     replies: []}, 
                    (err, docs) =>{
        if(err) console.log(err);
        res.redirect('/b/' + board + '/') // redirect /b/:board/
      })
    })
  }
  
  this.getThread = (req, res) => { // the same way like method get
    db.collection('boardDb')
      .find({board: req.params.board}, // for the page board
            {'reported': 0, //won't be send
             'delete_password': 0,
             'replies.reported': 0,
             'replies.delete_password': 0
            })
      .limit(10) // most recent 10 threads
      .toArray((err, data)=>{
        if(err) console.log(err);
        data.map((num) => { 
          num.count = num.replies.length; // all length replies, to calc. hiddenCount and showed in board.html
          num.replies = num.replies.slice(-3); // rewrite num replies to be 3 last elements
        })
        res.json(data) // all data for the path /api/threads/:board
    })
    
  }
  this.putThread = (req, res) =>{
    db.collection('boardDb')
      .findOneAndUpdate({_id: new ObjectID(req.body.thread_id)},
                        {$set:{reported: true}}, // only change reported
                       (err, data) =>{ 
      if(err) console.log(err);
      res.send('success');
    })
  }
  this.deleteThread = (req, res) =>{
    let id = req.body._id;
    let password = req.body.delete_password;
     db.collection('boardDb')
       .findOne({_id: new ObjectID(id)}, // find by id data
                (err, docs) =>{
       if(err) console.log(err);
       let match = bcrypt.compareSync(password, docs.delete_password); // encrypt hash password and compare
         if(match){ // if true, delete
            db.collection('boardDb')
                 .deleteOne({_id: new ObjectID(id), 
                             delete_password: docs.delete_password}, // find hash in db with hash
                            (err, data) =>{
              if(err) console.log(err);
              res.send('success');
            })
         }else{
           res.send('incorrect password')
         }
       })
  }

}
module.exports = Thread;
