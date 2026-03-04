const User = require("../models/userModel");
const OtpModel = require("../models/otpModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Blog = require("../models/blogModel");
const sendEmail = require("../utils/sendMail");
const otpModel = require("../models/otpModel");
const userModel = require("../models/userModel");

class AuthController {



  async AuthUserCheck(req, res, next) {
    try {
        if (req.user) {
            return next();
        } 
        
        return res.status(401).json({ 
            status: false,
            message: "Authentication failed: No user context found" 
        });
        
    } catch (err) {
        console.error("AuthUserCheck Error:", err);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
}

  // Register User
  async userRegister(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.render("register", {
          error: "Email already registered, Please try another email.",
          success: null,
          layout: "layout/auth",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        isVerified: false,
      });

      // Send OTP
      await sendEmail(user);
      return res.status(200).json({
        success: true,
        email: user.email,
        message: "Please verify by mail"
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async verifyAccount(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ status: false, message: "All fields are required" });
      }
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return res.status(400).json({ status: "failed", message: "Email doesn't exists" });
      }

      if (existingUser.is_verified) {
        return res.status(400).json({ status: false, message: "Email is already verified" });
      }

      const emailVerification = await otpModel.findOne({ userId: existingUser._id, otp });
      if (!emailVerification) {
        if (!existingUser.is_verified) {
          await sendEmail(req, existingUser);
          return res.status(400).json({ status: false, message: "Invalid OTP, new OTP sent to your email" });
        }
        return res.status(400).json({ status: false, message: "Invalid OTP" });
      }
      const currentTime = new Date();
      const expirationTime = new Date(emailVerification.createdAt.getTime() + 15 * 60 * 1000);
      if (currentTime > expirationTime) {
        await sendEmail(req, existingUser);
        return res.status(400).json({ status: "failed", message: "OTP expired, new OTP sent to your email" });
      }
      existingUser.is_verified = true;
      await existingUser.save();

      await otpModel.deleteMany({ userId: existingUser._id });
      return res.status(200).json({ status: true, message: "Email verified successfully please login" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }


  async resendOtp(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }

      await sendEmail(user);

      return res.json({
        success: true,
        message: "OTP resent successfully",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }


  // Login User
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });
      console.log("data", user.password);

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "invalid mail id",
        });
      }
      if (!user.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'user not verified please verify your account'
        })
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "invalid credentials",
        });
      }

      // JWT
      const token = jwt.sign(
        { id: user._id, name: user.name, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" },
      );

      // Session
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

     
      if (user.role === "admin") { return res.status(200).json({ status: true, message: "welcome to admin dashboard",token:token }); }
      if (user.role === "author") { return res.status(200).json({ status: true, message: "welcome to author dashboard",token:token }); }

      return res.status(200).json({ status: true, message: "welcome to user dashboard",token:token });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
        
      });

    }
  }

  
 // User Dashboard API
async dashboard(req, res) {
  try {
    const userId = req.user?.id || req.session?.user?.id;

    const myBlogs = await Blog.find({ author: userId });

    const stats = {
      totalBlogs: myBlogs.length,
      publishedBlogs: myBlogs.filter(b => b.isActive && b.isApproved).length,
      pendingApproval: myBlogs.filter(b => !b.isApproved).length
    };

    return res.status(200).json({
      success: true,
      user: {
        id: userId,
      },
      stats: stats,
      myRecentBlogs: myBlogs.slice(0, 5) // Send the 5 most recent blogs
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error loading dashboard data: " + error.message
    });
  }
}

  // Admin Dashboard
  async adminDashboard(req, res) {
  try {
    const totalBlogs = await Blog.countDocuments();
    const totalUsers = await User.countDocuments();
    const approvedBlogs = await Blog.countDocuments({ isApproved: true });
    const pendingBlogs = await Blog.countDocuments({ isApproved: false });

    return res.status(200).json({
      success: true,
      message: "Admin dashboard data fetched successfully",
      stats: {
        totalUsers,
        totalBlogs,
        approvedBlogs,
        pendingBlogs
      }
    });

  } catch (err) {
    console.error("Admin Dashboard Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error loading admin dashboard"
    });
  }
}

  // Author Dashboard

  async authorDashboard(req, res) {
  try {
    const userId = req.user?.id || req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user context found"
      });
    }

    const blogs = await Blog.find({ author: userId });

    return res.status(200).json({
      success: true,
      message: "Author dashboard data fetched successfully",
      stats: {
        totalBlogs: blogs.length,
        published: blogs.filter(b => b.isActive && b.isApproved).length,
        pending: blogs.filter(b => !b.isApproved).length
      },
      blogs: blogs
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while loading dashboard data",
      error: err.message
    });
  }
}



async resetPasswordLink(req,res){
    try{
      const { email } = req.body;
        if (!email) {
          return res.status(400).json({ status:false, message: "Email field is required" });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
          return res.status(404).json({ status:false, message: "Email doesn't exist" });
        }
        // Generate token for password reset
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const UrlLink = jwt.sign({ userID: user._id }, secret, { expiresIn: '20m' });

        const resetLink = `${process.env.FRONTEND_HOST}/account/reset-password-confirm/${user._id}/${UrlLink}`;
        console.log(resetLink);

        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "Password Reset Link",
          html: `<p>Hello ${user.name},</p><p>Please <a href="${resetLink}">Click here</a> to reset your password.</p>`
        });

        res.status(200).json({ status:true, message: "Password reset email sent. Please check your email." });
  

    }catch(error){
      console.log(error);
      
    }

  }


  async resetPassword(req,res){
   try{
        const { password, confirmPassword } = req.body;
       const { id, token } = req.params;
       const user = await userModel.findById(id);
       if (!user) {
         return res.status(404).json({ status:false, message: "User not found" });
       }

       const new_secret = user._id + process.env.JWT_SECRET_KEY;
       const decoded = jwt.verify(token, new_secret);
       if (!decoded) {
         return res.status(400).json({ status:false, message: "Invalid or expired link" });
       }
 
       if (!password || !confirmPassword) {
         return res.status(400).json({ status:false, message: "New Password and Confirm New Password are required" });
       }
 
       if (password !== confirmPassword) {
         return res.status(400).json({ status:false, message: "New Password and Confirm New Password don't match" });
       }

       const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
  

        const updatedUser = await userModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } });
  
        // Send success response
        res.status(200).json({ status: "success", message: "Password reset successfully" });
    }catch(error){
      console.log(error);
      
    } 

  }
  
}

module.exports = new AuthController();
