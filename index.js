const Koa = require('koa');
const app = new Koa();

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
app.use(ctx => {
  console.log('path:',ctx.path)
  if (ctx.path === '/') {
    ctx.body = 'Hello, master!';
    return
  } 
  
  if (ctx.path === '/wechat-sign') {
   let url = ctx.query.url
   if (!url) {
     ctx.throw(400, 'url querystring required!');
     return
   }
   const signPackage = getSignPackage(url);
   // TODO: cannot return JSON
   ctx.body = signPackage
   return
  } else { 
    ctx.throw(404);
  }
 
});

app.on('error', err => {
  console.log('server error', err)
});

app.listen(10030);
