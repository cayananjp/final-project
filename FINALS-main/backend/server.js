import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// CORS configuration - Allows your AWS Frontend to talk to this backend
app.use(cors({
    origin: ['https://main.d2ks3kh1klz0ua.amplifyapp.com', 'http://localhost:3000'],
    methods: ['GET', 'POST']
}));
app.use(express.json());

// Setup folder for temporary image storage
if (!fs.existsSync('uploads')) { fs.mkdirSync('uploads'); }
const upload = multer({ dest: 'uploads/' });

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Health check endpoint (for testing if server is awake)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'SavorSense Backend is running',
        geminiConfigured: !!process.env.GEMINI_API_KEY 
    });
});

// 2. Image Scanning Endpoint (Used by Pantry.js)
app.post('/api/scan-ingredients', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: "No image received." });

        console.log(`📸 Scanning Image: ${req.file.originalname}`);

        const imageData = fs.readFileSync(req.file.path);
        const base64Image = imageData.toString('base64');

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Identify the raw food ingredients in this image. Return ONLY a comma-separated list, all lowercase. If no food is found, return 'none'.";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: req.file.mimetype,
                    data: base64Image
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();
        
        // Clean up: Delete image from server after processing
        fs.unlinkSync(req.file.path); 

        const ingredientsArray = text.split(',')
            .map(item => item.trim().toLowerCase())
            .filter(i => i !== "" && i !== 'none');
        
        console.log("✅ Image Results:", ingredientsArray);
        res.json({ success: true, ingredients: ingredientsArray });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Voice Processing Endpoint (Used by Home.js)
app.post('/api/process-voice', async (req, res) => {
    try {
        const { text } = req.body;
        console.log(`🎤 Processing Voice Text: "${text}"`);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `From the following spoken text, extract ONLY the food ingredients: "${text}". 
        Return them as a simple comma-separated list in lowercase. 
        If no food is mentioned, return 'none'.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const resultText = response.text();

        const ingredientsArray = resultText.split(',')
            .map(item => item.trim().toLowerCase())
            .filter(i => i !== "" && i !== 'none');

        console.log("✅ Voice Results:", ingredientsArray);
        res.json({ success: true, ingredients: ingredientsArray });
    } catch (error) {
        console.error("❌ Voice API Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Use Render's dynamic port or default to 5000 for local testing
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server live on port ${PORT}`));