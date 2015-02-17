# koa-ssl

[![Circle CI](https://circleci.com/gh/jclem/koa-ssl.svg?style=svg)](https://circleci.com/gh/jclem/koa-ssl)

koa-ssl enforces SSL for [Koa][koa] apps.

## Use

Simply require and use the function exported by this module:

```javascript
var ssl = require('koa-ssl');
var app = require('koa')();
app.use(ssl());
```

The function takes an optional object of options:

- `disabled`: (default `false`) If `true`, this middleware will allow all
requests through.
- `trustProxy`: (default `false`) If `true`, trust the `x-forwarded-proto`
header. If it is "https", requests are allowed through.
- `disallow`: A non-Generator function called with the Koa context so that the
user can handle rejecting non-SSL requests themselves.

By default, this middleware will only run when `process.env.NODE_ENV` is set to
"production". Unless a `disallow` function is supplied it will respond with the
status code 403 and the body "Please use HTTPS when communicating with this
server."

## Thanks, Heroku

While I created and maintain this project, it was done while I was an employee
of [Heroku][heroku] on the Human Interfaces Team, and they were kind enough to
allow me to open source the work. Heroku is awesome.

[heroku]: https://www.heroku.com/home
[koa]: https://github.com/koajs/koa
