'use strict';

module.exports = function(useProxy, enable) {
  if (typeof enable === 'undefined') {
    enable = process.env.NODE_ENV === 'production';
  }

  return middleware;

  function* middleware(next) {
    if (!enable) return next;

    var isSecure = this.secure;

    if (!isSecure && useProxy) {
      isSecure = this.get('x-forwarded-proto') === 'https';
    }

    if (isSecure) {
      yield next;
    } else {
      if (this.method === 'GET') {
        this.status = 301;
        this.redirect('https://' + this.get('host') + this.originalUrl);
      } else {
        this.status = 403;
        this.body   = 'Please use HTTPS when communicating with this server.';
      }
    }
  }
};
