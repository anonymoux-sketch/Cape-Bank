const express=require('express');
const crypto=require('crypto');
const {readDb,writeDb,normalizeEmail,normalizeUsername,publicUser,hashPassword,verifyPassword,sign}=require('../lib/db');
const {auth,rateLimit}=require('../lib/middleware');
const router=express.Router();
router.post('/register',rateLimit,(req,res)=>{
const {firstName,lastName,email,username,password}
=req.body||{},e=normalizeEmail(email),u=normalizeUsername(username);
if(!firstName||!lastName||!e||!u||!password)return res.status(400).json({message:'All account fields are required.'});
if(!/^\S+@\S+\.\S+$/.test(e))return res.status(400).json({message:'Enter a valid email address.'});
if(!/^[a-z0-9._-]{3,30}$/.test(u))return res.status(400)
.json({message:'Username must be 3–30 characters using letters, numbers, dot, underscore or hyphen.'});
if(String(password).length<8)return res.status(400)
.json({message:'Password must contain at least 8 characters.'});
const db=readDb();if(Object.values(db.users).some(x=>x.email===e))return res.status(409)
.json({message:'An account with that email already exists.'});if(Object.values(db.users).some(x=>x.username===u))return 
res.status(409).json({message:'That username is already in use.'});
const id=crypto.randomUUID(),now=new Date().toISOString();db.users[id]={id,firstName:String(firstName)
.trim(),lastName:String(lastName).trim(),email:e,username:u,passwordHash:hashPassword(String(password)),createdAt:now,
account:{type:'Demo Checking',number:'•••• 4821',balance:1264580},transactions:[{id:crypto.randomUUID(),title:'Payroll deposit',date:'Sep 15, 2026',amount:3200,kind:'credit'},{id:crypto.randomUUID(),title:'Grocery Market',date:'Sep 14, 2026',amount:-86.42,kind:'debit'},{id:crypto.randomUUID(),title:'Online transfer',date:'Sep 12, 2026',amount:-450,kind:'debit'}]};writeDb(db);res.status(201).json({message:'Account created successfully. You can now sign in.'})});
router.post('/login',rateLimit,(req,res)=>{
const e=normalizeEmail(req.body?.email),password=String(req.body?.password||''),db=readDb(),user=Object.values(db.users)
.find(x=>x.email===e);if(!user||!verifyPassword(password,user.passwordHash))return res.status(401).json({message:'Incorrect email or password.'});res.json({accessToken:sign(user),user:publicUser(user)})});
router.get('/me',auth,(req,res)=>res.json({user:publicUser(req.user)}));
router.post('/logout',(req,res)=>res.json({ok:true}));
router.post('/change-password',rateLimit,auth,(req,res)=>
{const currentPassword=String(req.body?.currentPassword||''),newPassword=String(req.body?.newPassword||'');if(!verifyPassword(currentPassword,req.user.passwordHash))return res.status(401).json({message:'Current password is incorrect.'});if(newPassword.length<8)return res.status(400).json({message:'New password must contain at least 8 characters.'});const db=readDb();db.users[req.user.id].passwordHash=hashPassword(newPassword);writeDb(db);res.json({message:'Password changed successfully.'})});
router.post('/request-reset',rateLimit,(req,res)=>{const e=normalizeEmail(req.body?.email),db=readDb(),user=Object.values(db.users).find(x=>x.email===e);let devToken;if(user){devToken=crypto.randomBytes(24).toString('hex');db.resets[devToken]={userId:user.id,expiresAt:Date.now()+15*60*1000};writeDb(db)}const response={message:'If an account exists for that email, a reset request has been created.'};if(process.env.NODE_ENV!=='production'&&devToken)response.devToken=devToken;res.json(response)});
module.exports=router;
