require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// Serve static files
app.use(express.static('public'));

// Pricing API endpoint
app.get('/api/pricing', async (req, res) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an assistant that provides data in JSON format."
                },
                {
                    role: "user",
                    content: "Display a table of price offerings for CoreWeave GPUs, including GPU model, VRAM, and pricing per hour."
                }
            ]
        });

        const jsonResponse = JSON.parse(completion.choices[0].message.content);
        res.json({ pricing: jsonResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch pricing information." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
