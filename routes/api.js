/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
let Thread = require('../models/thread.model');

module.exports = app => {
  
  app.route('/api/threads/:board')

// User story 2 - I can POST a thread to a specific message board by passing form data text and delete_password to /api/threads/{board}.
// (Recomend res.redirect to board page /b/{board}) Saved will be _id, text, created_on(date&time),
// bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, & replies(array).
  .post(async (req, res) => {
    const { text, delete_password } = req.body;
    const { board } = req.params;
    
    try {
      let thread = new Thread({
        text,
        delete_password,
        replies: []
      })
    
      await thread.save();
      
      res.redirect(`/b/${board}`);
    } catch (err) {
      console.error(err);
      res.send('The thread could not be saved: ' + err);
    }
  })
  
// User story 6 - I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies 
// from /api/threads/{board}. The reported and delete_passwords fields will not be sent.
  .get((req, res) => {
    Thread.find()
    .sort({bumped_on: -1})
    .limit(10)
    .select({
      delete_password: 0,
      reported: 0,
      replies: {$slice: -3}
    })
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.send('Error finding thread: ' + err);
    })
  })
  
// User story 10 - I can report a thread and change it's reported value to true by sending a PUT request to /api/threads/{board} 
// and pass along the thread_id. (Text response will be 'success')
  .put((req, res) => {
    const { thread_id } = req.body;
    
    Thread.findOneAndUpdate({_id: thread_id}, {$set: {reported: true}}, {new: true, useFindAndModify: false})
    .then(doc => {
      res.send('Success updating thread');
    })
    .catch(err => {
      res.send('Error updating thread: ' + err);
    })
  })
  
// User story 8 - I can delete a thread completely if I send a DELETE request to /api/threads/{board} and pass along 
// the thread_id & delete_password. (Text response will be 'incorrect password' or 'success').
  .delete((req,res) => {
    const { thread_id, delete_password } = req.body;
    
    Thread.findOneAndRemove({_id: thread_id, delete_password}, {useFindAndModify: false})
    .then(doc => {
      console.log(doc);
      if (doc === null) {
        res.send('Incorrect password');
      } else {
        res.send('Success deleting thread');
      }
    })
    .catch(err => {
      res.send('Incorrect ID: ' + err);
    })
  })
  
  app.route('/api/replies/:board')
  
// User story 5 - I can POST a reply to a thread on a specific board by passing form data text, delete_password, & thread_id 
// to /api/replies/{board} and it will also update the bumped_on date to the comments date.
// (Recomend res.redirect to thread page /b/{board}/{thread_id}) In the thread's 'replies' array will be saved
// _id, text, created_on, delete_password, & reported.
  .post(async (req, res) => {
    const { text, delete_password, thread_id } = req.body;
    const { board } = req.params;
   
   try { 
     let thread = await Thread.findOneAndUpdate({_id: thread_id},
                                              {$set: {
                                                bumped_on: new Date()
                                              },
                                               $push: { replies: {
                                                           text,
                                                           reported: false,
                                                           created_on: new Date(),
                                                           delete_password
                                                        }
                                                      }
                                              },
                                              {new: true, useFindAndModify: false});
    
     res.redirect(`/b/${board}/${thread_id}`);
   } catch(err) {
     console.error(err);
     res.send('The thread ID is not valid: ' + err);
   }
  })
  
// User story 7 - I can GET an entire thread with all it's replies from /api/replies/{board}?thread_id={thread_id}. 
// Also hiding the reported and delete_passwords fields.
  .get((req, res) => {
    const { thread_id } = req.query;
    
    Thread.findById({_id: thread_id})
    .select({
      delete_password: 0,
      reported: 0,
      "replies.delete_password": 0,
      "replies.reported": 0
    })
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.send('Error with .find() to GET thread with all replies:' + err);
    })
  })
  
// User story 11 - I can report a reply and change it's reported value to true by sending a PUT request to /api/replies/{board} 
// and pass along the thread_id & reply_id. (Text response will be 'success')
  .put((req, res) => {
    const { thread_id, reply_id } = req.body;
    
    Thread.findOneAndUpdate({_id: thread_id, replies: {$elemMatch: {_id: reply_id}}}, {$set: {'replies.$.reported': true}}, {useFindAndModify: false})
    .then(doc => {
      res.send('Success updating reply');
    })
    .catch(err => {
      res.send('Error updating reply: ' + err);
    })
  })
  
// User story 9 - I can delete a post (just changing the text to '[deleted]') if I send a DELETE request to /api/replies/{board} 
// and pass along the thread_id, reply_id, & delete_password. (Text response will be 'incorrect password' or 'success').
  .delete((req,res) => {
    const { thread_id, reply_id, delete_password } = req.body;
  
    Thread.findOneAndUpdate({_id: thread_id, replies: {$elemMatch: {_id: reply_id, delete_password}}}, {$set: {'replies.$.text': '[DELETED]'}}, {useFindAndModify: false})
    .then(doc => {
      
      if (doc === null) {
        res.send('Incorrect Password');
      } else {
        res.send('Success deleting reply');
      }
    })
    .catch(err => {
      res.send('Incorrect thread id or reply id');
    })
  });
};
