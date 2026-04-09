# 🚨 QUICK FIX: Photo Scanning Not Working

## The Problem
Getting "Connection error" when scanning ingredients? 

## The Solution (30 seconds)

### Step 1: Check Gemini API Key
File: `backend/.env`
```env
GEMINI_API_KEY=your_api_key_here
```

**Don't have a key?** Get one free at: https://makersuite.google.com/app/apikey

### Step 2: Start Backend Server
Open a **NEW terminal** and run:
```bash
cd backend
npm start
```

Wait for: `🚀 SavorSense Backend (Gemini AI): http://localhost:5000`

### Step 3: Restart Frontend (if needed)
If you just updated `.env`, restart React:
```bash
# Press Ctrl+C to stop
npm start
```

### Step 4: Test
1. Go to Pantry page
2. Click "Upload / Take Photo"
3. Select an image with food
4. Should work now! ✅

## What You'll See

✅ **Success**: "✓ Found 5 ingredients!"
- Gemini AI identified real ingredients from your photo

⚠️ **Demo Mode**: "⚠️ Demo mode: Using sample ingredients"
- Backend is working but Gemini API failed
- Sample ingredients will be added (beef, tomato sauce, etc.)
- Check your API key or quota

❌ **Error**: "❌ Backend server not running"
- Go back to Step 2

## Still Not Working?

### Check 1: Is backend running?
Open http://localhost:5000 in browser
- Should see an error (that's good!)
- If nothing loads, backend isn't running

### Check 2: Is Gemini API key valid?
```bash
cd backend
cat .env | grep GEMINI_API_KEY
```
Should show: `GEMINI_API_KEY=AIza...`

### Check 3: Is .env correct?
File: `.env` (in root folder)
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Check 4: Did you restart React?
After changing `.env`, you MUST restart:
```bash
Ctrl+C
npm start
```

## Easy Mode: Use Startup Scripts

**Windows**: Double-click `start-all.bat`

**Mac/Linux**: 
```bash
chmod +x start-all.sh
./start-all.sh
```

## About the Gemini API

The scanner uses **Google's Gemini AI** to identify ingredients:
- **Model**: gemini-1.5-flash (fast and accurate)
- **Free Tier**: 60 requests/minute, 1,500/day
- **Get API Key**: https://makersuite.google.com/app/apikey

## Need More Help?
- **Gemini API Setup**: Read `GEMINI_API_SETUP.md`
- **Backend Setup**: Read `BACKEND_SETUP.md`
- **Full Details**: Read `SCANNING_FIX_SUMMARY.md`
