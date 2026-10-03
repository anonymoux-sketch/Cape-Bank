const express=require('express');const cors=require('cors');const path=require('path');
const authRoutes=require('./routes/auth'),profileRoutes=require('./routes/profile'),accountRoutes=require('./routes/account'),notificationRoutes=require('./routes/notifications'),billRoutes=require('./routes/bills'),transferRoutes=require('./routes/transfers');
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'32kb'}));app.use(cors({origin:process.env.FRONTEND_ORIGIN?process.env.FRONTEND_ORIGIN.split(',').map(s=>s.trim()):true}));
app.use((req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Cache-Control',req.path.startsWith('/api/')?'no-store':'no-cache');next()});
app.get('/api/health',(req,res)=>res.json({ok:true,service:'cape-bank-api',time:new Date().toISOString()}));
app.use('/api/auth',authRoutes);app.use('/api/profile',profileRoutes);app.use('/api/account',accountRoutes);app.use('/api/notifications',notificationRoutes);app.use('/api/bills',billRoutes);app.use('/api/transfers',transferRoutes);
app.use(express.static(path.join(__dirname,'..')));app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'..','index.html')));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({message:'Internal server error.'})});module.exports=app;
