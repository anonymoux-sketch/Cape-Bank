const jwt = require('jsonwebtoken');
const {readDb}=require('./db');
const JWT_SECRET=process.env.JWT_SECRET||'change-this-development-secret';
const hits=new Map();
function rateLimit(req,res,next){const key=`${req.ip}:${req.path}`,now=Date.now();const arr=(hits.get(key)||[]).filter(t=>now-t<60000);arr.push(now);hits.set(key,arr);if(arr.length>12)return res.status(429).json({message:'Too many attempts. Please wait a minute and try again.'});next()}
function auth(req,res,next){const h=req.headers.authorization||'',token=h.startsWith('Bearer ')?h.slice(7):null;if(!token)return res.status(401).json({message:'Authentication required.'});try{const payload=jwt.verify(token,JWT_SECRET),db=readDb(),user=db.users[payload.sub];if(!user)return res.status(401).json({message:'Session is no longer valid.'});req.user=user;next()}catch{return res.status(401).json({message:'Session expired. Please sign in again.'})}}
module.exports={rateLimit,auth};
