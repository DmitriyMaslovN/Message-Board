/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
let threadId;
let threadId1; // for put
let replyId;
chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('create two request, for two ways thread, and replies', function(done){
        chai.request(server)
          .post('/api/threads/:board') 
          .send({board: 'board',
                 text: 'some text', 
                 delete_password: 'del123'}) // thread test
          .end((err, res)=>{
            assert.equal(res.status, 200);
        }) 
        chai.request(server)
          .post('/api/threads/:board') 
          .send({board: 'board',
                 text: 'some text', 
                 delete_password: 'del123'}) // thread reply test
          .end((err, res)=>{
            assert.equal(res.status, 200)
          done();
      });
    })
  })
    suite('GET', function() {
      test('most recent 10 threads and most 3 reply', function(done){
        chai.request(server)
          .get('/api/threads/:board')
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], '_id', 'should be _id');
            assert.property(res.body[0], 'board', 'should be board');
            assert.property(res.body[0], 'text', 'should be text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'replies');
            assert.isArray(res.body[0].replies);
          threadId = res.body[0]._id;
          threadId1 = res.body[1]._id;
         done();
        })
      })
    });
    
    suite('PUT', function() {
      test('reported must be true', function(done){
        chai.request(server)
          .put('/api/threads/:board')
          .send({_id: threadId})
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success')
          done();
        })
      });
    }) 
    
    suite('DELETE', function() {
      test('for incorrect password', function(done){
        chai.request(server)
          .delete('/api/threads/:board')
          .send({_id: threadId, delete_password: 'nopassword'})
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
          done();
        })
       });
      
     test('for correct password', function(done){
        chai.request(server)
          .delete('/api/threads/:board')
          .send({_id: threadId, delete_password: 'del123'})
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
          done();
        })
      });
    })
  })
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('change replies thread', function(done){
        chai.request(server)
          .post('/api/replies/:board')
          .send({_id: threadId1,
                 text: 'some array text',
                 delete_password: 'del321'})
          .end((err, res)=>{
            assert.equal(res.status, 200);
          done();  
        })
      })
    });
    
    suite('GET', function() {
      test('get thread and replies', function(done){
        chai.request(server)
          .get('/api/replies/:board')
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.property(res.body, '_id', 'should be _id');
            assert.property(res.body, 'board', 'should be board');
            assert.property(res.body, 'text', 'should be text');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'bumped_on');
            assert.property(res.body, 'replies');
            assert.isArray(res.body.replies);
            assert.property(res.body.replies[0], '_id')
            assert.property(res.body.replies[0], 'text');
            assert.equal(res.body.replies[0]. text, 'some array text');
          replyId = res.body.replies[0]._id;
          done();
        })
      })
    });
    
    suite('PUT', function() {
      
      test('reported reply success', function(done){
        chai.request(server)
          .put('/api/replies/:board')
          .send({_id: threadId1, "replies[0]._id": replyId})
          .end((err, res)=>{
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
          done();
        })
      })
    });
    
    suite('DELETE', function() {
      
      test('incorrect password', function(done){
        chai.request(server)
          .delete('/api/replies/:board')
          .send({thread_id: threadId1, 
                 reply_id: replyId,
                delete_password: 'incorrect password' })
          .end((err, res)=>{
            assert.equal(res.status, 200)
            assert.equal(res.text, 'incorrect password');
          done();
        })
      });
      
      test('success password', function(done){
          chai.request(server)
            .delete('/api/replies/:board')
            .send({thread_id: threadId1, 
                   reply_id: replyId,
                   delete_password: 'del321'})
            .end((err, res)=>{
              assert.equal(res.status, 200)
              assert.equal(res.text, 'success');
          done();
        })
      });
    });
  })
});
