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

chai.use(chaiHttp);

let threadId1;
let threadId2;
let replyId;
let deleteReplyPass;

// User story 12 - Complete functional tests that wholely test routes and pass.
suite('Functional Tests', () => {
  
  suite('API ROUTING FOR /api/threads/:board', () => {
    
    suite('POST', () => {
      
      test('Create 2 new threads (because we end up deleting 1 in the delete test)', done => {
       chai.request(server)
        .post('/api/threads/fcc')
        .send({text: 'testing1', delete_password: 'lol', replies: []})
        .end((err, res) => {
          assert.equal(res.status, 200);
        });
       chai.request(server)
        .post('/api/threads/fcc')
        .send({text: 'testing2', delete_password: 'lol', replies: []})
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('GET', () => {
      
      test('GET 10 most recent threads with 3 most recent replies', done => {
       chai.request(server)
        .get('/api/threads/fcc')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body[0], 'text');;
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'replies');
          assert.notProperty(res.body[0], 'reported');
          assert.notProperty(res.body[0], 'delete_password');
          assert.isArray(res.body[0].replies);
          assert.isBelow(res.body[0].replies.length, 4);
          assert.isBelow(res.body.length, 11);
          threadId1 = res.body[0]._id;
          threadId2 = res.body[1]._id;
          done();
        });
      });
      
    });
    
    suite('DELETE', () => {
      
      test('Delete thread', done => {
       chai.request(server)
        .delete('/api/threads/fcc')
        .send({thread_id: threadId1, delete_password: 'lol'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Success deleting thread');
          done();
        });
      });
      
    });
    
    suite('PUT', () => {
      
      test('Update reported parameter of thread to "true"', done => {
       chai.request(server)
        .put('/api/threads/fcc')
        .send({thread_id: threadId2})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Success updating thread');
          done();
        });
      });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', () => {
    
    suite('POST', () => {
      
      test('POST reply to a thread', done => {
       chai.request(server)
        .post('/api/replies/fcc')
        .send({thread_id: threadId2, text: 'testing 2', delete_password: 'hey'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('GET', () => {
      
      test('GET thread with all replies', done => {
       chai.request(server)
        .get('/api/replies/fcc')
        .query({thread_id: threadId2})
        .end((err, res) => {
          console.log(res.body);
          assert.equal(res.status, 200);
          assert.property(res.body, 'text');;
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'replies');
          assert.notProperty(res.body, 'delete_password');
          assert.notProperty(res.body, 'reported');
          assert.isArray(res.body.replies);
          assert.property(res.body.replies[0], 'text');
          assert.property(res.body.replies[0], 'created_on');
          assert.notProperty(res.body.replies[0], 'delete_password');
          assert.notProperty(res.body.replies[0], 'reported');
          replyId = res.body.replies[0]._id; 
          done();
        });
      });
      
    });
    
    suite('PUT', () => {
      
      test('Update reported parameter of reply to "true"', done => {
       chai.request(server)
        .put('/api/replies/fcc')
        .send({thread_id: threadId2, reply_id: replyId})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Success updating reply');
          done();
        });
      });
      
    });
    
    suite('DELETE', () => {
      
      test('Delete reply by changing text to [DELETED]', done => {
       chai.request(server)
        .delete('/api/replies/fcc')
        .send({thread_id: threadId2, reply_id: replyId, delete_password: 'hey'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Success deleting reply');
          done();
        });
      });
      
    });
    
  });

});
