'use strict';

let co           = require('co');
let should       = require('should');
let thunk        = require('thunkify');
let app          = require('./test-helper').app;
let createServer = require('./test-helper').createServer;
let ssl          = require('../index');
let listen       = require('./test-helper').listen;
let post         = thunk(require('request').post);

describe('SSL redirect', function() {
  let uri, server;

  afterEach(function() {
    process.env.NODE_ENV = 'test';
    app.middleware = [];
    server.close();
  });

  function* setup(sslArgs) {
    app.use(ssl.apply(null, sslArgs));
    app.use(function*() { this.body = 'ok'; });
    server = yield createServer();
    uri = 'http://localhost:' + server.address().port;
  }

  function get(headers) {
    headers || (headers = {});
    return thunk(require('request').get)(uri, {
      headers: headers,
      followRedirect: false
    });
  }

  function post(headers) {
    headers || (headers = {});
    return thunk(require('request').post)(uri, { headers: headers });
  }

  describe('with no arguments', function() {
    describe('when the request is a GET', function() {
      describe('and NODE_ENV is not production', function() {
        it('does not redirect', co(function*() {
          yield setup();
          let res = yield get();
          res[0].statusCode.should.eql(200);
        }));
      });

      describe('and NODE_ENV is production', function() {
        it('redirects', co(function*() {
          process.env.NODE_ENV = 'production';
          yield setup();
          let res = yield get();
          res[0].statusCode.should.eql(301);
          res[0].headers.location.should.eql(uri.replace('http', 'https') + '/');
        }));
      });
    });

    describe('when the request is not a GET', function() {
      describe('and NODE_ENV is not production', function() {
        it('does not redirect', co(function*() {
          yield setup();
          let res = yield post();
          res[0].statusCode.should.eql(200);
        }));
      });

      describe('and NODE_ENV is production', function() {
        it('redirects', co(function*() {
          process.env.NODE_ENV = 'production';
          yield setup();
          let res = yield post();
          res[0].statusCode.should.eql(403);
          res[0].body.should.eql('Please use HTTPS when communicating with this server.');
        }));
      });
    });
  });

  describe('when useProxy is true', function() {
    describe('and x-forwarded-proto is http', function() {
      describe('and NODE_ENV is not production', function() {
        it('does not redirect', co(function*() {
          yield setup([true]);
          let res = yield get();
          res[0].statusCode.should.eql(200);
        }));
      });

      describe('and NODE_ENV is production', function() {
        it('redirects', co(function*() {
          process.env.NODE_ENV = 'production';
          yield setup([true]);
          let res = yield get();
          res[0].statusCode.should.eql(301);
          res[0].headers.location.should.eql(uri.replace('http', 'https') + '/');
        }));
      });
    });

    describe('and x-forwarded-proto is https', function() {
      describe('and NODE_ENV is not production', function() {
        it('does not redirect', co(function*() {
          yield setup([true]);
          let res = yield get({ 'x-forwarded-proto': 'https' });
          res[0].statusCode.should.eql(200);
        }));
      });

      describe('and NODE_ENV is production', function() {
        it('does not redirect', co(function*() {
          process.env.NODE_ENV = 'production';
          yield setup([true]);
          let res = yield get({ 'x-forwarded-proto': 'https' });
          res[0].statusCode.should.eql(200);
        }));
      });
    });
  });

  describe('when enable is true', function() {
    it('redirects non-SSL', co(function*() {
      yield setup([null, true]);
      let res = yield get();
      res[0].statusCode.should.eql(301);
      res[0].headers.location.should.eql(uri.replace('http', 'https') + '/');
    }));
  });
});
