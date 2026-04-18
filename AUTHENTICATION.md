# ConcentraTrack Authentication System

## 🔐 Enhanced Authentication Features

The ConcentraTrack application now includes a robust, production-ready authentication system with the following features:

### ✅ **Secure User Registration & Login**
- **Password Hashing**: Uses bcrypt with 12 salt rounds for maximum security
- **JWT Tokens**: 7-day expiration with secure token management
- **Email Validation**: Client and server-side email format validation
- **Password Requirements**: Minimum 6 characters with strength validation
- **Duplicate Prevention**: Prevents multiple accounts with same email

### ✅ **Data Persistence**
- **File-Based Storage**: User data and test results stored in JSON files
- **Automatic Backup**: Data persists between server restarts
- **User Isolation**: Each user's data is completely separate and secure
- **Test History**: All test results are permanently saved and retrievable

### ✅ **Security Features**
- **Protected Routes**: All user data endpoints require valid JWT tokens
- **Token Expiration**: Automatic logout when tokens expire
- **Access Control**: Users can only access their own data
- **Password Security**: Passwords are never stored in plain text
- **Session Management**: Secure login/logout with token cleanup

## 🚀 **How to Use**

### **Option 1: Create Your Own Account**
1. Visit `http://localhost:3000`
2. Click "Sign up" 
3. Fill in your details:
   - **Full Name**: Your real name
   - **Email**: Valid email address (will be your username)
   - **Password**: At least 6 characters
   - **Confirm Password**: Must match your password
4. Click "Sign Up" to create your account
5. You'll be automatically logged in

### **Option 2: Use Demo Account**
For testing purposes, a demo account is available:
- **Email**: `demo@concentratrack.com`
- **Password**: `demo123`

### **Login Process**
1. Visit `http://localhost:3000`
2. Enter your email and password
3. Click "Login"
4. Your dashboard will load with all your previous test data

## 📊 **Data Persistence Features**

### **What Gets Saved:**
- ✅ User profile information (name, email, join date)
- ✅ All vision test results with scores and timestamps
- ✅ All hearing test results with accuracy percentages
- ✅ Test answers and response times
- ✅ Performance statistics and trends
- ✅ Login history and last access times

### **Data Security:**
- 🔒 Passwords encrypted with bcrypt (12 salt rounds)
- 🔒 JWT tokens for secure API access
- 🔒 User data isolation (users can't see others' data)
- 🔒 Protected API endpoints with authentication
- 🔒 Automatic token expiration and renewal

## 🗂️ **Data Storage Location**

User data is stored in the `data/` directory:
```
data/
├── users.json      # User accounts and profiles
└── tests.json      # All test results and scores
```

## 🔄 **Session Management**

### **Automatic Features:**
- **Remember Login**: Stay logged in for 7 days
- **Auto Logout**: Automatic logout when token expires
- **Session Recovery**: Resume where you left off after browser restart
- **Secure Logout**: Complete data cleanup on logout

### **Token Management:**
- **JWT Tokens**: Secure, stateless authentication
- **7-Day Expiration**: Tokens automatically expire for security
- **Automatic Renewal**: Seamless token refresh when needed
- **Secure Storage**: Tokens stored securely in browser

## 🧪 **Testing the Authentication**

### **Test Scenarios:**
1. **Registration**: Create new account with valid details
2. **Login**: Login with existing credentials
3. **Data Persistence**: Take tests, logout, login again - data should persist
4. **Security**: Try accessing without login - should redirect to login page
5. **Token Expiration**: Wait for token to expire - should auto-logout

### **Demo Workflow:**
1. **Sign up** with your email
2. **Take some tests** (vision and hearing)
3. **Logout** completely
4. **Close browser** and reopen
5. **Login again** - all your test history should be there!

## 🛠️ **Technical Implementation**

### **Backend Security:**
- **bcrypt**: Password hashing with salt rounds
- **jsonwebtoken**: JWT token generation and validation
- **Express middleware**: Protected route authentication
- **File system**: Secure JSON file storage
- **Input validation**: Server-side data validation

### **Frontend Security:**
- **Token management**: Automatic token storage and cleanup
- **API integration**: Secure API calls with authentication headers
- **Form validation**: Client-side input validation
- **Error handling**: Graceful handling of authentication errors
- **Session recovery**: Automatic login state restoration

## 🎯 **Benefits for Users**

### **Convenience:**
- ✅ **One-time setup**: Create account once, use forever
- ✅ **Cross-device access**: Login from any device with your credentials
- ✅ **Automatic save**: Never lose your test progress
- ✅ **Long sessions**: Stay logged in for up to 7 days

### **Progress Tracking:**
- ✅ **Complete history**: See all your past test results
- ✅ **Performance trends**: Track improvement over time
- ✅ **Detailed analytics**: Comprehensive statistics and insights
- ✅ **Personal dashboard**: Customized view of your progress

### **Security & Privacy:**
- ✅ **Private data**: Your results are completely private
- ✅ **Secure access**: Only you can access your account
- ✅ **Data protection**: Industry-standard security measures
- ✅ **Safe logout**: Complete data cleanup when you logout

## 🔧 **For Developers**

### **API Endpoints:**
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/user/:id` - Get user profile (protected)
- `POST /api/test-result` - Save test result (protected)
- `GET /api/user/:id/tests` - Get user tests (protected)
- `GET /api/user/:id/stats` - Get user statistics (protected)
- `POST /api/logout` - User logout (protected)

### **Authentication Flow:**
1. User registers/logs in
2. Server generates JWT token
3. Client stores token securely
4. All API requests include token in Authorization header
5. Server validates token for protected routes
6. Token expires after 7 days, requiring re-login

The authentication system is now production-ready and provides a secure, user-friendly experience for tracking concentration levels over time!