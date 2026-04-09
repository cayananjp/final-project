# 🔄 RESTART BACKEND SERVER

## The Problem
You're getting the same 5 ingredients (beef, tomato sauce, liver spread, potatoes, carrots) every time because the backend server is running **old code** with demo fallback.

## The Solution

### Step 1: Stop Backend Server
In the terminal where backend is running, press:
```
Ctrl + C
```

You should see the server stop.

### Step 2: Start Backend Server Again
```bash
cd backend
npm start
```

Wait for:
```
🚀 SavorSense Backend (Gemini AI): http://localhost:5000
```

### Step 3: Test Again
1. Go to Pantry page
2. Upload a photo
3. Watch the backend console

## What You Should See in Backend Console

### When Scanning:
```
📸 Processing with Gemini: photo.jpg
🤖 Calling Gemini API...
✅ Gemini API responded
📝 Raw Gemini response: chicken, tomatoes, onions, garlic
🤖 Gemini Response: ["chicken", "tomatoes", "onions", "garlic"]
```

### If API Fails:
```
📸 Processing with Gemini: photo.jpg
🤖 Calling Gemini API...
❌ API ERROR: [error message]
Error name: [error type]
Full error: [detailed error]
```

## Troubleshooting

### Still Getting Same 5 Ingredients?

**This means the Gemini API is failing.** Check:

1. **API Key Valid?**
   ```bash
   cat backend/.env
   ```
   Should show: `GEMINI_API_KEY=AIza...`

2. **API Key Working?**
   - Go to: https://makersuite.google.com/app/apikey
   - Check if key is still valid
   - Generate new key if needed

3. **Quota Exceeded?**
   - Free tier: 60 requests/minute
   - Check usage at: https://makersuite.google.com/app/apikey
   - Wait a minute and try again

4. **Network Issues?**
   - Check internet connection
   - Try again in a few minutes

### Backend Console Shows Error?

**Read the error message carefully:**

#### "Invalid API key"
- API key is wrong or expired
- Get new key from Google AI Studio
- Update `backend/.env`
- Restart backend

#### "Quota exceeded"
- Too many requests
- Wait 1 minute
- Try again

#### "Model not found"
- Wrong model name (should be "gemini-1.5-flash")
- Code is correct, shouldn't happen

#### Network error
- Internet connection issue
- Firewall blocking Google AI
- Try again later

## Verify New Code is Running

After restarting, the backend should:
- ✅ Call Gemini API for every scan
- ✅ Return actual ingredients from photo
- ✅ Show detailed console logs
- ❌ Never return demo ingredients
- ❌ No "demo mode" messages

## Test with Different Photos

Try these to verify it's working:

### Test 1: Chicken Photo
Upload photo of chicken
**Expected**: Should detect "chicken" or "chicken breast"

### Test 2: Vegetables Photo
Upload photo of vegetables
**Expected**: Should detect actual vegetables in photo

### Test 3: Empty Plate
Upload photo of empty plate
**Expected**: Should say "No food ingredients detected"

## If Still Not Working

1. **Check backend console** - What error is shown?
2. **Check browser console** (F12) - Any errors?
3. **Test API key manually**:
   ```bash
   # In backend folder
   node -e "
   import('dotenv').then(d => d.config());
   console.log('API Key:', process.env.GEMINI_API_KEY);
   "
   ```

4. **Try new API key**:
   - Get from: https://makersuite.google.com/app/apikey
   - Update `backend/.env`
   - Restart backend

## Summary

**The backend MUST be restarted to load the new code!**

1. Stop backend (Ctrl+C)
2. Start backend (`npm start`)
3. Test scanning
4. Check console logs

If you see detailed Gemini API logs, the new code is running! 🎉
