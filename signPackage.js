var sign = require('./sign.js');
var rp = require('request-promise');

require('dotenv').config()

let redis = require('redis');
let client = redis.createClient(6379, 'redis');
let Promise = require("bluebird");
Promise.promisifyAll(redis.RedisClient.prototype);
 
async function getAccessToken () {
    let access_token = await client.getAsync('accessToken')

    if (access_token) {
        return access_token
    }

    let appid = process.env.APPID
    let appSecret = process.env.APPSECRET
    var options = {
        uri: 'https://api.weixin.qq.com/cgi-bin/token',
        qs: {
            grant_type: 'client_credential',
            appid: appid,
            secret: appSecret
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };

    let result = await rp(options)

    client.set('accessToken', result.access_token);
    client.expire('jsapiTicket', 7000);
    
    return result.access_token;
 }
 
async function getJsApiTicket () {
    let ticket = await client.getAsync('jsapiTicket')

    if (ticket) {
        return ticket
    }

    const token = await getAccessToken()

    var options = {
        uri: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
        qs: {
            type: 'jsapi',
            access_token: token,
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };

    let result = await rp(options)

    client.set('jsapiTicket', result.ticket);
    client.expire('jsapiTicket', 7000);
    
    return result.ticket;

 }

 async function getSignPackage(url) {
    const jsapi_ticket = await getJsApiTicket()
    let _sign = sign(jsapi_ticket, url)
    return { ..._sign, appId: process.env.APPID }
 }

module.exports = getSignPackage
