# Gemini API Setup Guide

## Overview
The photo scanning feature uses **Google's Gemini AI** to identify ingredients from images. This guide will help you set up and troubleshoot the Gemini API integration.

## What is Gemini?
Gemini is Google's multimodal AI model that can understand and analyze images, text, and more. We use it to:
1. Analyze photos of food/ingredients
2. Identify individual ingredients
3. Return a list of ingredients to add to the pantry

## Quick Setup

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Add API Key to Backend

Edit `backend/.env`:
```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Restart Backend Server

```bash
cd backend
npm start
```

You should see:
```
🚀 SavorSense Backend (Gemini AI): http://localhost:5000
```

## Current Implementation

### Model Used
- **Model**: `gemini-1.5-flash`
- **Type**: Multimodal (text + images)
- **Speed**: Fast (optimized for quick responses)
- **Cost**: Free tier available

### API Package
- **Package**: `@google/generative-ai`
- **Version**: ^0.24.1
- **Documentation**: https://ai.google.dev/tutorials/node_quickstart

### How It Works

```javascript
// 1. User uploads image
const imageData = fs.readFileSync(imagePath);
const base64Image = imageData.toString('base64');

// 2. Send to Gemini
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const result = await model.generateContent([
    "Identify ingredients...",
    { inlineData: { mimeType: "image/jpeg", data: base64Image } }
]);

// 3. Parse response
const text = result.response.text();
const ingredients = text.split(',').map(i => i.trim());

// 4. Return to frontend
res.json({ success: true, ingredients });
```

## Testing the API

### Test 1: Check API Key
```bash
cd backend
node -e "console.log(require('dotenv').config().parsed.GEMINI_API_KEY)"
```

Should output your API key (not "undefined")

### Test 2: Test with Sample Image
1. Start backend server
2. Use Postman or curl:

```bash
curl -X POST http://localhost:5000/api/scan-ingredients \
  -F "image=@/path/to/food-image.jpg"
```

Expected response:
```json
{
  "success": true,
  "ingredients": ["tomato", "onion", "garlic", "chicken"]
}
```

### Test 3: Check Backend Logs
When scanning, you should see:
```
📸 Processing with Gemini: image.jpg
🤖 Gemini Response: ["tomato", "onion", "garlic"]
```

## Troubleshooting

### Error: "API key not valid"
**Cause**: Invalid or expired API key

**Solution**:
1. Generate new API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update `backend/.env`
3. Restart backend server

### Error: "Quota exceeded"
**Cause**: Free tier limit reached (60 requests per minute)

**Solution**:
1. Wait a minute and try again
2. Upgrade to paid tier if needed
3. Implement rate limiting in backend

### Error: "Model not found"
**Cause**: Using wrong model name

**Solution**: 
- Current code uses `gemini-1.5-flash` (correct)
- Don't use `gemini-3-flash-preview` (doesn't exist)

### Always Getting Demo Mode
**Causes**:
1. API key not set
2. API key invalid
3. Network issues
4. Gemini API down

**Check**:
```bash
# In backend folder
cat .env | grep GEMINI_API_KEY
```

Should show: `GEMINI_API_KEY=AIza...`

### Images Not Being Recognized
**Causes**:
1. Image too large (>4MB)
2. Wrong image format
3. No food in image
4. Poor image quality

**Solutions**:
- Use JPEG or PNG format
- Keep images under 4MB
- Ensure food is clearly visible
- Use good lighting

## API Limits (Free Tier)

| Limit | Value |
|-------|-------|
| Requests per minute | 60 |
| Requests per day | 1,500 |
| Image size | 4MB max |
| Supported formats | JPEG, PNG, WebP, HEIC, HEIF |

## Failover Mode

If Gemini API fails, the backend automatically switches to **demo mode**:

```javascript
// Failover ingredients
const demoIngredients = [
    "beef", 
    "tomato sauce", 
    "liver spread", 
    "potatoes", 
    "carrots"
];
```

**User sees**: "⚠️ Demo mode: Using sample ingredients"

**Why it's good**:
- App doesn't crash
- Users can still test the feature
- Development continues without API key

## Upgrading to Paid Tier

If you need more requests:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable billing
3. Enable Generative Language API
4. Update API key if needed

**Pricing**: Pay-as-you-go (very affordable for small apps)

## Alternative: Use Different Model

### Gemini 1.5 Pro (More Accurate)
```javascript
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
```
- More accurate
- Slower
- Higher cost

### Gemini 1.5 Flash (Current - Recommended)
```javascript
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```
- Fast
- Good accuracy
- Lower cost
- **Currently used**

## Security Best Practices

### ✅ DO:
- Keep API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables
- Rotate keys periodically

### ❌ DON'T:
- Commit API keys to Git
- Share API keys publicly
- Use API keys in frontend code
- Hardcode API keys

## Monitoring Usage

Check your usage at:
https://makersuite.google.com/app/apikey

You can see:
- Total requests
- Requests per day
- Quota remaining
- Error rate

## Example Responses

### Good Response
```json
{
  "success": true,
  "ingredients": [
    "chicken breast",
    "tomatoes",
    "onions",
    "garlic",
    "bell peppers"
  ]
}
```

### Demo Mode Response
```json
{
  "success": true,
  "ingredients": [
    "beef",
    "tomato sauce",
    "liver spread",
    "potatoes",
    "carrots"
  ],
  "isMock": true
}
```

### Error Response
```json
{
  "success": false,
  "error": "No image received."
}
```

## Backend Console Output

### Successful Scan
```
📸 Processing with Gemini: IMG_1234.jpg
🤖 Gemini Response: ["chicken", "tomato", "onion"]
```

### Failed Scan (Failover)
```
📸 Processing with Gemini: IMG_1234.jpg
❌ API ERROR: Invalid API key
⚠️ Switching to Failover Demo Data...
```

## Need Help?

1. Check [Google AI Documentation](https://ai.google.dev/docs)
2. Review backend console logs
3. Test with curl/Postman
4. Verify API key is valid
5. Check quota limits

## Summary

✅ **Fixed**: Updated to use correct Gemini API (`@google/generative-ai`)
✅ **Model**: Using `gemini-1.5-flash` (fast and accurate)
✅ **Failover**: Demo mode if API fails
✅ **Logging**: Detailed console output for debugging
✅ **Error Handling**: Graceful degradation

The scanner should now work properly with the Gemini API! 🎉
