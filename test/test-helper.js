'use strict';

process.env.NODE_ENV     = 'test';
process.env.SILENCE_LOGS = 'true';

let http   = require('http');
let koa    = require('koa');
let app    = koa();

exports.app = app;

exports.createServer = function*() {
  let server = http.createServer(app.callback());
  yield listen();
  return server;

  function listen() {
    return function(cb) {
      server.listen(cb);
    };
  }
};
