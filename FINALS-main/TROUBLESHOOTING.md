# Troubleshooting: "Connection error. Please try again later."

## Quick Diagnosis

### Step 1: Check if Backend is Running

Open a new terminal and run:
```bash
cd backend
npm start
```

**Expected output**:
```
🚀 SavorSense Backend (Gemini AI): http://localhost:5000
```

**If you see this**, backend is running ✅

**If you see an error**, check:
- Node.js is installed (`node --version`)
- Dependencies are installed (`npm install` in backend folder)
- Port 5000 is not in use

### Step 2: Test Backend Connection

Open your browser and go to:
```
http://localhost:5000/api/health
```

**Expected response**:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "geminiConfigured": true
}
```

**If you see this**, backend is accessible ✅

**If page doesn't load**, backend is not running or port is wrong

### Step 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try scanning an image
4. Look for error messages

**Common errors**:

#### "Failed to fetch"
**Cause**: Backend not running or wrong URL

**Solution**:
```bash
# Terminal 1 - Start backend
cd backend
npm start

# Terminal 2 - Restart frontend
npm start
```

#### "CORS error"
**Cause**: CORS not configured properly

**Solution**: Backend already has CORS enabled, but verify:
```javascript
// backend/server.js should have:
app.use(cors());
```

#### "404 Not Found"
**Cause**: Wrong endpoint URL

**Solution**: Check `.env` file:
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Step 4: Check Environment Variables

#### Frontend (.env in root folder)
```bash
cat .env
```

Should show:
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

**If missing**, add it and restart React:
```bash
# Stop React (Ctrl+C)
npm start
```

#### Backend (backend/.env)
```bash
cat backend/.env
```

Should show:
```env
GEMINI_API_KEY=AIza...
```

**If missing**, get API key from: https://makersuite.google.com/app/apikey

### Step 5: Check Console Logs

When you try to scan, check the console output:

**Frontend Console** (Browser F12):
```
📸 Starting scan... {fileName: "photo.jpg", fileSize: 123456, fileType: "image/jpeg"}
🔗 Backend URL: http://localhost:5000
📡 Response status: 200
📦 Response data: {success: true, ingredients: [...]}
```

**Backend Console** (Terminal):
```
📸 Processing with Gemini: photo.jpg
🤖 Gemini Response: ["chicken", "tomato", "onion"]
```

## Common Issues & Solutions

### Issue 1: "Backend server not running"

**Symptoms**:
- Error message: "Backend server not running. Please start the backend server"
- Browser console shows: "Failed to fetch"

**Solution**:
```bash
# Open new terminal
cd backend
npm start

# Wait for: 🚀 SavorSense Backend (Gemini AI): http://localhost:5000
```

### Issue 2: "Connection error" but backend is running

**Possible causes**:
1. Wrong port
2. CORS issue
3. Firewall blocking

**Solution**:
```bash
# Check if backend is on port 5000
curl http://localhost:5000/api/health

# Should return: {"status":"ok",...}
```

If this works but frontend doesn't connect:
1. Check `.env` has `REACT_APP_BACKEND_URL=http://localhost:5000`
2. Restart React app
3. Clear browser cache

### Issue 3: Always getting demo mode

**Symptoms**:
- Status shows: "⚠️ Demo mode: Using sample ingredients"
- Backend logs show: "❌ API ERROR"

**Causes**:
1. Gemini API key missing
2. Gemini API key invalid
3. Gemini API quota exceeded

**Solution**:
```bash
# Check API key exists
cat backend/.env | grep GEMINI_API_KEY

# Should show: GEMINI_API_KEY=AIza...
```

If missing or invalid:
1. Get new key: https://makersuite.google.com/app/apikey
2. Update `backend/.env`
3. Restart backend

### Issue 4: Port 5000 already in use

**Symptoms**:
- Backend won't start
- Error: "EADDRINUSE: address already in use :::5000"

**Solution**:

**Windows**:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Mac/Linux**:
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
```

Or change the port in `backend/server.js`:
```javascript
const PORT = 5001; // Change to different port
```

And update `.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:5001
```

### Issue 5: Image too large

**Symptoms**:
- Scan takes very long
- Eventually times out

**Solution**:
- Resize image before uploading
- Max recommended size: 4MB
- Use JPEG format (smaller than PNG)

### Issue 6: No ingredients detected

**Symptoms**:
- Status shows: "✗ Could not identify ingredients"
- Backend returns empty array

**Causes**:
1. No food in image
2. Image quality too poor
3. Gemini couldn't identify items

**Solution**:
- Use clear, well-lit photos
- Ensure food is visible
- Try different angle
- Use close-up shots

## Testing Checklist

Run through this checklist:

- [ ] Backend server is running (`npm start` in backend folder)
- [ ] Backend accessible at http://localhost:5000/api/health
- [ ] `.env` has `REACT_APP_BACKEND_URL=http://localhost:5000`
- [ ] `backend/.env` has valid `GEMINI_API_KEY`
- [ ] React app restarted after `.env` changes
- [ ] Browser console shows no CORS errors
- [ ] Port 5000 is not blocked by firewall
- [ ] Image file is under 4MB
- [ ] Image format is JPEG or PNG

## Still Not Working?

### Enable Debug Mode

Add this to `src/components/Pantry.js` at the top:
```javascript
const DEBUG = true;
```

This will show detailed console logs.

### Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try scanning
4. Look for `/api/scan-ingredients` request
5. Check:
   - Status code (should be 200)
   - Response body
   - Request headers

### Manual Test with curl

```bash
# Test with a sample image
curl -X POST http://localhost:5000/api/scan-ingredients \
  -F "image=@path/to/your/image.jpg"
```

Expected response:
```json
{
  "success": true,
  "ingredients": ["chicken", "tomato", "onion"]
}
```

## Get Help

If still not working, provide:
1. Frontend console logs (F12 → Console)
2. Backend console output
3. Network tab screenshot
4. `.env` file contents (hide API key)
5. Error message screenshot

## Quick Reset

If everything is broken, try a full reset:

```bash
# Stop all servers (Ctrl+C in all terminals)

# Clean install backend
cd backend
rm -rf node_modules
npm install
npm start

# In new terminal - Clean install frontend
cd ..
rm -rf node_modules
npm install
npm start

# Test again
```

This will ensure all dependencies are correctly installed.
