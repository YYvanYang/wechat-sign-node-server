const Koa = require('koa');
const app = new Koa();
const compose = require('koa-compose');

const path = require('path');
const serve = require('koa-static');
const getSignPackage = require('./signPackage');
const publicFiles = serve(path.join(__dirname, 'public'));
publicFiles._name = 'static /public';

app.use(publicFiles);

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// response

async function home(ctx, next) {
  if ('/' == ctx.path) {
    ctx.body = 'Hello, master!';
  } else {
    await next();
  }
};

async function wechatSign(ctx, next) {
  if ('/wechat-sign' == ctx.path) {
    let url = ctx.query.url
    if (!url) {
      ctx.throw(400, 'url querystring required!');
      return
    }
    const signPackage = getSignPackage(url);
    // TODO: cannot return JSON
    ctx.body = signPackage
  } else {
    await next();
  }
}

async function notfound(ctx, next) {
  let whitelist = ['/', '/wechat-sign']
  if (whitelist.indexOf(ctx.path) === -1) {
    ctx.throw(404);
  } else {
    await next();
  }
};

const all = compose([home, wechatSign, notfound]);

app.use(all);

app.on('error', err => {
  console.log('server error', err)
});

app.listen(10030);
