'use strict';

/* jshint mocha: true */

let co           = require('co');
let thunk        = require('thunkify');
let app          = require('./test-helper').app;
let createServer = require('./test-helper').createServer;
let ssl          = require('../index');

require('should');

describe('SSL middleware', function() {
  let uri, server;

  afterEach(function() {
    process.env.NODE_ENV = 'test';
    app.middleware = [];
    server.close();
  });

  function* setup(sslArgs) {
    app.use(ssl(sslArgs));
    app.use(function*() { this.body = 'ok'; });
    server = yield createServer();
    uri = 'http://localhost:' + server.address().port;
  }

  function get(headers) {
    headers = headers || {};

    return thunk(require('request').get)(uri, {
      headers: headers,
      followRedirect: false
    });
  }

  describe('with no arguments', function() {
    describe('and NODE_ENV is not production', function() {
      it('does not redirect', co(function*() {
        yield setup();
        let res = yield get();
        res[0].statusCode.should.eql(200);
      }));
    });

    describe('and NODE_ENV is production', function() {
      it('responds with a 403', co(function*() {
        process.env.NODE_ENV = 'production';
        yield setup();
        let res = yield get();
        res[0].statusCode.should.eql(403);
        res[1].should.eql('Please use HTTPS when communicating with this server.');
      }));
    });
  });

  describe('when trustProxy is true', function() {
    describe('and x-forwarded-proto is http', function() {
      describe('and NODE_ENV is not production', function() {
        it('does not redirect', co(function*() {
          yield setup({ trustProxy: true });
          let res = yield get();
          res[0].statusCode.should.eql(200);
        }));
      });

      describe('and NODE_ENV is production', function() {
        it('responds with a 403', co(function*() {
          process.env.NODE_ENV = 'production';
          yield setup({ trustProxy: true });
          let res = yield get();
          res[0].statusCode.should.eql(403);
          res[1].should.eql('Please use HTTPS when communicating with this server.');
        }));
      });
    });

    describe('and x-forwarded-proto is https', function() {
      describe('and NODE_ENV is not production', function() {
        it('does not redirect', co(function*() {
          yield setup({ trustProxy: true });
          let res = yield get({ 'x-forwarded-proto': 'https' });
          res[0].statusCode.should.eql(200);
        }));
      });

      describe('and NODE_ENV is production', function() {
        it('does not redirect', co(function*() {
          process.env.NODE_ENV = 'production';
          yield setup({ trustProxy: true });
          let res = yield get({ 'x-forwarded-proto': 'https' });
          res[0].statusCode.should.eql(200);
        }));
      });
    });
  });

  describe('when disallow is set', function() {
    it('calls the disallow function', co(function*() {
      yield setup({ disallow: disallow, disabled: false });
      let res = yield get();
      res[0].statusCode.should.eql(403);
      res[1].should.eql('Disallowed.');

      function disallow(ctx) {
        ctx.status = 403;
        ctx.body   = 'Disallowed.';
      }
    }));
  });

  describe('when disabled is false', function() {
    it('responds with a 403', co(function*() {
      yield setup({ disabled: false });
      let res = yield get();
      res[0].statusCode.should.eql(403);
      res[1].should.eql('Please use HTTPS when communicating with this server.');
    }));
  });
});
