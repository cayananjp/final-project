# Backend Server Setup Guide

## Issue: "Connection error. Please try again later" when scanning

This error occurs when the backend server is not running. The photo scanning feature requires the backend server to process images using Google's Gemini AI.

## Quick Fix

### 1. Start the Backend Server

Open a **new terminal** and run:

```bash
cd backend
npm start
```

You should see:
```
🚀 SavorSense Backend (Gemini 3): http://localhost:5000
```

### 2. Restart the Frontend (if needed)

If you just added the `REACT_APP_BACKEND_URL` environment variable, restart the React app:

```bash
# Stop the current React app (Ctrl+C)
npm start
```

## Environment Variables

### Frontend (.env)
```env
SUPABASE_URL=https://dwtywmfxpisnoazlrmas.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Backend (backend/.env)
```env
GEMINI_API_KEY=AIzaSyBkp-cYKHWzgebtr4RHODtNfEBUNLcxboE
```

## How It Works

1. **User uploads photo** → Frontend sends image to backend
2. **Backend processes** → Uses Google Gemini 3 AI to identify ingredients
3. **Returns results** → Frontend adds ingredients to pantry
4. **Failover mode** → If Gemini API fails, returns demo ingredients

## Troubleshooting

### Error: "Backend server not running"
**Solution**: Start the backend server (see step 1 above)

### Error: "Failed to fetch"
**Causes**:
- Backend server not running
- Wrong port (should be 5000)
- CORS issues

**Solution**: 
1. Check backend is running on port 5000
2. Verify `REACT_APP_BACKEND_URL=http://localhost:5000` in `.env`
3. Restart both frontend and backend

### Error: "Server responded with status: 500"
**Causes**:
- Gemini API key invalid or expired
- Gemini API quota exceeded
- Image processing error

**Solution**: 
- Backend will automatically use demo mode (sample ingredients)
- Check backend console for detailed error messages

### Demo Mode Activated
If you see "⚠️ Demo mode: Using sample ingredients", it means:
- Gemini API call failed
- Backend is using fallback demo data
- Ingredients added: beef, tomato sauce, liver spread, potatoes, carrots

## Backend Dependencies

The backend requires:
- Node.js (v14+)
- Express
- Multer (file uploads)
- @google/genai (Gemini 3 SDK)
- dotenv
- cors

Install with:
```bash
cd backend
npm install
```

## Testing the Backend

Test if backend is running:
```bash
curl http://localhost:5000/api/scan-ingredients
```

Expected response:
```json
{"success":false,"error":"No image received."}
```

This confirms the backend is running and accepting requests.

## Production Deployment

For production, update `REACT_APP_BACKEND_URL` to your deployed backend URL:
```env
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

## Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │  HTTP   │   Backend   │   API   │  Gemini 3   │
│   (React)   │────────>│  (Express)  │────────>│     AI      │
│             │         │             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
      │                        │
      │                        │
      v                        v
┌─────────────┐         ┌─────────────┐
│  Supabase   │         │   Uploads   │
│  Database   │         │   Folder    │
└─────────────┘         └─────────────┘
```

## Status Messages

| Message | Meaning |
|---------|---------|
| 🔍 Analyzing pantry items... | Processing image |
| ✓ Found X ingredients! | Success (real AI) |
| ⚠️ Demo mode: Using sample ingredients | Failover mode active |
| ❌ Backend server not running | Start backend server |
| ❌ Connection error | Network/server issue |
| ✗ Could not identify ingredients | No food detected in image |
