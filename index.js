'use strict';

module.exports = function ssl(options) {
  options = options || {};

  let enabled = options.hasOwnProperty('disabled') ?
    !options.disabled : process.env.NODE_ENV === 'production';

  return sslMiddleware;

  /* jshint validthis: true */
  function* sslMiddleware(next) {
    if (!enabled) return yield next;

    let isSecure = this.secure;

    if (!isSecure && options.trustProxy) {
      isSecure = this.get('x-forwarded-proto') === 'https';
    }

    if (isSecure) {
      yield next;
    } else if (typeof options.disallow === 'function') {
      options.disallow(this);
    } else {
      this.status = 403;
      this.type   = 'text/plain';
      this.body   = 'Please use HTTPS when communicating with this server.';
    }
  }
};
