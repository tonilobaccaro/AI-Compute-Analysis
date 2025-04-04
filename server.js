require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// Serve static files
app.use(express.static('public'));

// News API endpoint
app.get('/api/news', async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: `Generate 5 news headlines about ${req.query.category}`
            }]
        });
        
        res.json({ articles: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Pricing API endpoint
app.get('/api/pricing', async (req, res) => {
    try {
        const tokens = Math.ceil(req.query.words * 1.33); // Convert words to tokens
        const cost = (tokens * 0.002 / 1000).toFixed(4); // Using GPT-3.5 pricing
        
        res.json({ cost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
