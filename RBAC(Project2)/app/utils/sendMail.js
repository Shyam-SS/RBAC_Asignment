const  transporter  = require("../config/emailConfig")
const otpModel=require('../models/otpModel')

const sendEmail=async(user)=>{
    // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Save OTP in Database
  const gg=await new otpModel({ userId: user._id, otp: otp }).save();
  console.log('otp',gg);
  

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "OTP - Verify your account",
    text:"",
    html: `<p>Dear ${user.name},</p><p>Thank you for signing up with our website. To complete your registration, please verify your email address by entering the following one-time password (OTP)</p>
    <h2 style="text-align: center; background-color: #a61616ff; padding: 10px;">OTP: ${otp}</h2>
    <p>This OTP is valid for 15 minutes. If you didn't request this OTP, please ignore this email.</p>`
  })

  return otp
}

module.exports=sendEmail;