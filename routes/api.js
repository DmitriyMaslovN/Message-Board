/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
let Thread = require('../controllers/threads.js');
let Reply = require('../controllers/replies.js');

module.exports = function (app) {
  let threads = new Thread(); // create new object
  let replies = new Reply();
  app.route('/api/threads/:board')
    .get(threads.getThread) //  methods of constructor Thread
    .post(threads.postThread)
    .put(threads.putThread)
    .delete(threads.deleteThread);
  app.route('/api/replies/:board')
    .get(replies.getReply) //  methods of constructor Reply
    .post(replies.postReply)
    .put(replies.putReply)
    .delete(replies.deleteReply);
};
