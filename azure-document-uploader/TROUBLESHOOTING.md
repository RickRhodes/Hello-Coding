# Troubleshooting Guide - "Why Blocked?"

## 🚫 Common Blocking Issues & Solutions

### 1. **CORS Blocking** (Most Common)

**Symptoms:**
- Browser console error: "blocked by CORS policy"
- Network requests failing from frontend to backend
- API calls returning CORS errors

**Cause:** Backend only allows requests from `http://localhost:3000`

**Solutions:**
```bash
# Check your CLIENT_URL setting
cat server/.env

# Make sure it matches your frontend URL
CLIENT_URL=http://localhost:3000
```

**If running on different ports:**
```env
# server/.env
CLIENT_URL=http://localhost:3001  # Or whatever port your frontend uses
```

**For production:**
```env
CLIENT_URL=https://your-frontend-domain.com
```

### 2. **Rate Limiting Blocking**

**Symptoms:**
- Error: "Too many uploads from this IP, please try again later"
- Upload requests failing after 10 attempts

**Cause:** Built-in rate limiting (10 uploads per 15 minutes per IP)

**Solutions:**

**Temporary fix (development):**
```javascript
// In server/index.js, comment out rate limiting:
// app.use('/api/upload', uploadLimiter);
```

**Adjust limits:**
```javascript
// In server/index.js, modify the rate limiter:
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increase limit to 50 uploads
  message: 'Too many uploads from this IP, please try again later.'
});
```

### 3. **File Type Blocking**

**Symptoms:**
- Error: "File type not supported"
- Upload failing for certain file types

**Cause:** Only specific file types are allowed

**Current allowed types:**
- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)
- PowerPoint (`.ppt`, `.pptx`)
- Text (`.txt`)
- Images (`.jpg`, `.jpeg`, `.png`, `.gif`)

**Solution - Add more file types:**
```javascript
// In server/index.js, modify allowedTypes array:
const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  // Add more types:
  'application/zip',
  'video/mp4',
  'audio/mpeg'
];
```

### 4. **File Size Blocking**

**Symptoms:**
- Error: "File too large. Maximum size is 100MB"
- Large files failing to upload

**Cause:** 100MB file size limit

**Solution - Increase limit:**
```javascript
// In server/index.js, modify fileSize limit:
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // Increase to 500MB
  },
  // ... rest of config
});
```

### 5. **Azure Storage Connection Blocking**

**Symptoms:**
- Error: "Azure Storage connection string not found"
- Error: "Failed to fetch containers"
- All API calls failing

**Cause:** Invalid or missing Azure connection string

**Solution:**
1. **Get your Azure connection string:**
   - Go to Azure Portal
   - Navigate to your Storage Account
   - Go to "Access keys"
   - Copy "Connection string"

2. **Update server/.env:**
```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=YOURACCOUNT;AccountKey=YOURKEY==;EndpointSuffix=core.windows.net
```

3. **Restart the server:**
```bash
npm run server:dev
```

### 6. **Port/Network Blocking**

**Symptoms:**
- Cannot access http://localhost:3000 or http://localhost:5000
- "This site can't be reached" errors

**Solutions:**

**Check if ports are in use:**
```bash
# Check port 3000
lsof -i :3000

# Check port 5000  
lsof -i :5000
```

**Use different ports:**
```bash
# Frontend on different port
cd client
PORT=3001 npm start

# Backend on different port
cd server
PORT=5001 npm run dev
```

**Update CORS accordingly:**
```env
# server/.env
CLIENT_URL=http://localhost:3001
PORT=5001
```

### 7. **Firewall/Antivirus Blocking**

**Symptoms:**
- Applications start but can't communicate
- Intermittent blocking

**Solutions:**
- Temporarily disable firewall/antivirus
- Add Node.js to firewall exceptions
- Allow ports 3000 and 5000 in firewall

### 8. **Browser Security Blocking**

**Symptoms:**
- Files not uploading despite no errors
- Strange browser behavior

**Solutions:**
- Clear browser cache and cookies
- Try incognito/private mode
- Disable browser extensions
- Try a different browser

## 🔧 Quick Diagnostic Commands

**Check if backend is running:**
```bash
curl http://localhost:5000/api/health
```

**Check if frontend can reach backend:**
```bash
curl -H "Origin: http://localhost:3000" http://localhost:5000/api/health
```

**Check environment variables:**
```bash
cd server && cat .env
```

**Check if Azure connection works:**
```bash
cd server && node -e "
require('dotenv').config();
const { BlobServiceClient } = require('@azure/storage-blob');
try {
  const client = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  console.log('Azure connection: OK');
} catch(e) {
  console.log('Azure connection: FAILED -', e.message);
}
"
```

## 🚀 Quick Fix Checklist

1. ✅ **Azure connection string is set correctly in `server/.env`**
2. ✅ **Both frontend (3000) and backend (5000) are running**
3. ✅ **CLIENT_URL matches your frontend URL**
4. ✅ **File type is supported (PDF, Office docs, images, text)**
5. ✅ **File size is under 100MB**
6. ✅ **Haven't exceeded rate limit (10 uploads/15min)**
7. ✅ **Firewall/antivirus not blocking Node.js**

## 🆘 Still Blocked?

If you're still experiencing blocking issues:

1. **Check browser console** for specific error messages
2. **Check server logs** for backend errors
3. **Try the health check**: http://localhost:5000/api/health
4. **Restart both applications**:
   ```bash
   # Kill all processes and restart
   npm run dev
   ```

Most blocking issues are related to CORS configuration or Azure connection strings. Double-check these first!