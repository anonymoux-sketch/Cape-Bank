const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-development-secret';
fs.mkdirSync(DATA_DIR, { recursive: true });
function readDb(){ if(!fs.existsSync(DB_FILE)) return {users:{},resets:{}}; try{return JSON.parse(fs.readFileSync(DB_FILE,'utf8'))}catch{return {users:{},resets:{}}} }
function writeDb(db){const tmp=DB_FILE+'.tmp';fs.writeFileSync(tmp,JSON.stringify(db,null,2));fs.renameSync(tmp,DB_FILE)}
function normalizeEmail(v){return String(v||'').trim().toLowerCase()}
function normalizeUsername(v){return String(v||'').trim().toLowerCase()}
function publicUser(u){return {id:u.id,first:u.firstName,last:u.lastName,email:u.email,username:u.username,createdAt:u.createdAt}}
function hashPassword(password,salt=crypto.randomBytes(16).toString('hex')){return `${salt}:${crypto.scryptSync(password,salt,64).toString('hex')}`}
function verifyPassword(password,stored){const [salt,key]=String(stored).split(':');if(!salt||!key)return false;const derived=crypto.scryptSync(password,salt,64).toString('hex');const a=Buffer.from(key,'hex'),b=Buffer.from(derived,'hex');return a.length===b.length&&crypto.timingSafeEqual(a,b)}
function sign(user){return jwt.sign({sub:user.id,email:user.email},JWT_SECRET,{expiresIn:'8h'})}
module.exports={readDb,writeDb,normalizeEmail,normalizeUsername,publicUser,hashPassword,verifyPassword,sign,DB_FILE};
