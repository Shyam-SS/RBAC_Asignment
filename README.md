📘 Role-Based Authentication System with Email OTP Verification
📌 Project Overview
This project is a secure authentication system built using:
-Node.js
-Express.js
-MongoDB
-JWT
-SMTP Email Service

It allows users to:
-Register
-Verify email using OTP
-Login securely
-Access protected routes based on assigned roles (admin, user, author).

🎯 Project Objective
To implement a secure backend authentication system with:
-JWT-based authentication
-Email OTP verification
-Role-Based Access Control (RBAC)
-Secure password hashing
-MVC architecture

🏗 Project Architecture
MVC Structure:
app/
 ├── config/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middlewares/
 ├── utils/
public/
view/

🔐 Features
1️⃣ User Registration
-Accepts name, email, password, role
-Hashes password using bcrypt
-Creates user with isVerified = false
-Sends 6-digit OTP to email

Endpoint: POST /register

2️⃣ Email OTP Verification
-Accepts OTP from user
-Validates expiration
-Activates user account

Endpoint:POST /verify-otp

3️⃣ Login
-Checks credentials
-Blocks unverified users
-Returns JWT token on success

Endpoint: POST /login
4️⃣ Role-Based Access Control
-JWT verification middleware
-Role-check middleware
-Protected routes for:
   -Admin
   -User
   -Author

Example: GET /admin/dashboard

🗂 Database Models
User Model
-name
-email
-password
-role
-isVerified

OTP Model
-userId
-otp
-expiresAt

🔑 Security Measures
-Password hashing using bcrypt
-JWT authentication
-Role-based authorization
-OTP expiration logic
-Environment variables for secrets

⚙️ Environment Variables
Create a .env file:

PORT=3000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

🚀 Installation & Setup
git clone <repo-url>
cd project-folder
npm install
npm run dev

Server runs at:
http://localhost:3000

🧪 Testing
All endpoints tested using Postman.

📌 Functional Modules
-Auth Module
-OTP Module
-User Module
-Middleware Layer
-Email Service
-MongoDB Models

🔮 Future Enhancements
-Forgot password with OTP
-Refresh token system
-Multi-role hierarchy
-Rate limiting on OTP
-Frontend dashboard (React)

📜 License
This project is for academic and learning purposes.
