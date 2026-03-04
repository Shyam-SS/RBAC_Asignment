const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


const AuthCheck=async(req,res,next)=>{
    const token=req.body?.token||req.query?.token||req.headers['x-access-token']||req.headers['authorization'];
    if(!token){
        return res.status(400).json({
            status:false,
            message:'Token is required for authentication'
        })
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.user=decoded;
        console.log('afterlogin user',req.user);
    }catch(err){
        return res.status(400).json({
            status:false,
            message:"invalid token"
        })
    }
    return next();
}


module.exports = AuthCheck;