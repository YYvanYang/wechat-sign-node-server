const Koa = require('koa');
const app = new Koa();
const compose = require('koa-compose');
const logger = require('koa-logger');
const render = require('./lib/render');

const path = require('path');
const serve = require('koa-static');
const getSignPackage = require('./signPackage');
const publicFiles = serve(path.join(__dirname, 'public'));
publicFiles._name = 'static /public';

app.use(publicFiles);

app.use(logger());

app.use(render);

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

// custom 404

app.use(async function(ctx, next) {
  await next();
  if (ctx.body || !ctx.idempotent) return;
  ctx.redirect('/404.html');
});

async function home(ctx, next) {
  if ('/' == ctx.path) {
    let url = ctx.href.split('#')[0]
    url = url.replace(/^http:/i, 'https:')

    const signPackage = await getSignPackage(url);
    await ctx.render('index', { signPackage });
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
    const signPackage = await getSignPackage(url);
    ctx.body = signPackage
  } else {
    await next();
  }
}

const all = compose([home, wechatSign]);

app.use(all);

app.on('error', err => {
  console.log('server error', err)
});

app.listen(10030);
