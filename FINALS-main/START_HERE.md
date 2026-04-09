# 🚀 START HERE - Photo Scanner Setup

## The Error You're Seeing

```
❌ Connection error. Please try again later.
```

## Why It Happens

The photo scanner needs **TWO servers** running:
1. **Frontend** (React) - Port 3000
2. **Backend** (Express + Gemini AI) - Port 5000

If backend isn't running → Connection error ❌

## Fix It in 3 Steps

### Step 1: Start Backend Server

**Open a NEW terminal** and run:
```bash
cd backend
npm start
```

**Wait for this message**:
```
🚀 SavorSense Backend (Gemini AI): http://localhost:5000
```

✅ **Backend is now running!**

### Step 2: Verify Backend Works

Open browser and go to:
```
http://localhost:5000/api/health
```

**You should see**:
```json
{
  "status": "ok",
  "message": "Backend is running",
  "geminiConfigured": true
}
```

✅ **Backend is accessible!**

### Step 3: Test the Scanner

1. Go to your app (http://localhost:3000)
2. Click "Pantry" in navigation
3. Click "Upload / Take Photo"
4. Select an image with food
5. Should work now! 🎉

## What You'll See

### ✅ Success
```
🔍 Analyzing pantry items...
✓ Found 5 ingredients!
```

Ingredients will be added to your pantry!

### ⚠️ Demo Mode
```
⚠️ Demo mode: Using sample ingredients
```

This means:
- Backend is working ✅
- But Gemini API failed ⚠️
- Sample ingredients added (beef, tomato sauce, etc.)

**Why?**
- API key missing or invalid
- API quota exceeded
- Network issue

**Fix**: Check `backend/.env` has valid `GEMINI_API_KEY`

### ❌ Still Error
```
❌ Backend server not running
```

**Go back to Step 1** - Backend isn't running

## Need Gemini API Key?

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
5. Add to `backend/.env`:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
6. Restart backend

## Quick Commands

### Start Everything (Easy Mode)

**Windows**:
```bash
start-all.bat
```

**Mac/Linux**:
```bash
chmod +x start-all.sh
./start-all.sh
```

### Manual Start (Recommended)

**Terminal 1 - Backend**:
```bash
cd backend
npm start
```

**Terminal 2 - Frontend**:
```bash
npm start
```

## Troubleshooting

### Backend won't start?
```bash
cd backend
npm install
npm start
```

### Frontend can't connect?
Check `.env` file (in root folder):
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

If you added this, **restart React**:
```bash
# Press Ctrl+C
npm start
```

### Port 5000 in use?
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

## Architecture

```
┌─────────────────┐
│   Frontend      │  Port 3000
│   (React)       │  ← You see this
└────────┬────────┘
         │
         │ HTTP Request
         ↓
┌─────────────────┐
│   Backend       │  Port 5000
│   (Express)     │  ← Must be running!
└────────┬────────┘
         │
         │ API Call
         ↓
┌─────────────────┐
│  Gemini AI      │  Google Cloud
│  (Image AI)     │  ← Identifies ingredients
└─────────────────┘
```

## Files You Need

### Frontend
- `.env` - Must have `REACT_APP_BACKEND_URL=http://localhost:5000`

### Backend
- `backend/.env` - Must have `GEMINI_API_KEY=your_key`
- `backend/server.js` - The backend code
- `backend/package.json` - Dependencies

## Checklist

Before testing, verify:

- [ ] Backend server is running (Terminal 1)
- [ ] Frontend server is running (Terminal 2)
- [ ] http://localhost:5000/api/health shows "ok"
- [ ] `.env` has REACT_APP_BACKEND_URL
- [ ] `backend/.env` has GEMINI_API_KEY
- [ ] Both servers restarted after .env changes

## Still Not Working?

Read the detailed guides:
- **Quick Fix**: `QUICK_FIX.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Gemini Setup**: `GEMINI_API_SETUP.md`
- **Backend Setup**: `BACKEND_SETUP.md`

## Summary

**The scanner needs the backend server running!**

1. ✅ Start backend: `cd backend && npm start`
2. ✅ Verify: http://localhost:5000/api/health
3. ✅ Test scanner in app

That's it! 🎉
