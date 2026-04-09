import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Setup file uploads
if (!fs.existsSync('uploads')) { fs.mkdirSync('uploads'); }
const upload = multer({ dest: 'uploads/' });

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Backend is running',
        geminiConfigured: !!process.env.GEMINI_API_KEY 
    });
});

app.post('/api/scan-ingredients', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, error: "No image received." });

        console.log(`📸 Processing with Gemini: ${req.file.originalname}`);

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error("❌ GEMINI_API_KEY not configured");
            return res.status(500).json({ 
                success: false, 
                error: "AI scanning service not configured. Please add GEMINI_API_KEY to backend/.env" 
            });
        }

        // Read image as base64
        const imageData = fs.readFileSync(req.file.path);
        const base64Image = imageData.toString('base64');

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create the prompt
        const prompt = "Identify the raw food ingredients in this image. Return ONLY a comma-separated list, all lowercase. If no food is found, return 'none'.";

        console.log("🤖 Calling Gemini API...");
        
        // Generate content with image
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: req.file.mimetype,
                    data: base64Image
                }
            }
        ]);

        console.log("✅ Gemini API responded");
        
        const response = await result.response;
        const text = response.text();
        
        console.log("📝 Raw Gemini response:", text);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path); 

        const ingredientsArray = text.split(',')
            .map(item => item.trim().toLowerCase())
            .filter(i => i !== "" && i !== 'none');
        
        console.log("🤖 Gemini Response:", ingredientsArray);
        
        if (ingredientsArray.length === 0) {
            return res.json({ 
                success: false, 
                error: "No food ingredients detected in the image. Please try a different photo." 
            });
        }
        
        res.json({ success: true, ingredients: ingredientsArray });

    } catch (error) {
        console.error("❌ API ERROR:", error.message);
        console.error("Error name:", error.name);
        console.error("Full error:", error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // Return proper error response with details
        res.status(500).json({ 
            success: false, 
            error: `Failed to scan image: ${error.message}. Please check your API key and try again.` 
        });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 SavorSense Backend (Gemini AI): http://localhost:${PORT}`));