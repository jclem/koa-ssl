# koa-ssl

[![Build Status](https://travis-ci.org/jclem/koa-ssl.svg)](https://travis-ci.org/jclem/koa-ssl)

koa-ssl enforces SSL for [koa][koa] apps. By default, it will not trust proxies
(i.e. by the `x-forwarded-for` header), and it will only be enabled when
`process.env.NODE_ENV === 'production'` is true.

## Use

```javascript
var ssl = require('koa-ssl');
app.use(ssl(useProxy, enable));
```

`useProxy` tells koa-ssl to trust the `x-forwarded-proto` header from a
proxy server (for example, a Heroku app, which is served by Nginx).

`enable` tells koa-ssl to be enabled. If there is no argument passed, it
defaults to the value of `process.env.NODE_ENV === 'production'`.

## Thanks, Heroku

While I created and maintain this project, it was done while I was an employee
of [Heroku][heroku] on the Human Interfaces Team, and they were kind enough to
allow me to open source the work. Heroku is awesome.

[heroku]: https://www.heroku.com/home
[koa]: https://github.com/koajs/koa
