require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// News API endpoint
app.get('/api/news', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Generate 5 news headlines about ${req.query.category || 'technology'}`
      }]
    });
    
    res.json({ articles: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CoreWeave pricing API endpoint
app.get('/api/pricing', async (req, res) => {
  try {
    // Attempt to scrape the CoreWeave pricing page
    const response = await axios.get('https://www.coreweave.com/pricing/classic');
    const $ = cheerio.load(response.data);
    
    // Fallback data in case scraping fails or returns incomplete data
    const fallbackData = [
      { model: "NVIDIA HGX H100", vram: 80, price: "$4.76/hour" },
      { model: "NVIDIA H100 PCIe", vram: 80, price: "$4.25/hour" },
      { model: "A100 80GB PCIe", vram: 80, price: "$2.21/hour" },
      { model: "A6000", vram: 48, price: "$1.28/hour" },
      { model: "A40", vram: 48, price: "$1.68/hour" },
      { model: "V100 SXM4", vram: 16, price: "$1.00/hour" }
    ];
    
    // Extract data from the page (this is a simplified example)
    const scrapedData = [];
    
    // Use the GPU pricing sections from the page
    $('.pricing-table').each((i, element) => {
      const model = $(element).find('.gpu-model').text().trim();
      const vram = $(element).find('.vram').text().trim();
      const price = $(element).find('.price').text().trim();
      
      if (model && price) {
        scrapedData.push({
          model: model,
          vram: vram.replace('GB', ''),
          price: price
        });
      }
    });
    
    // Use scraped data if available, otherwise use fallback data
    const pricingData = scrapedData.length > 0 ? scrapedData : fallbackData;
    
    res.json({ pricing: pricingData });
  } catch (error) {
    console.error('Scraping error:', error);
    
    // Return fallback data if scraping fails
    const fallbackData = [
      { model: "NVIDIA HGX H100", vram: 80, price: "$4.76/hour" },
      { model: "NVIDIA H100 PCIe", vram: 80, price: "$4.25/hour" },
      { model: "A100 80GB PCIe", vram: 80, price: "$2.21/hour" },
      { model: "A6000", vram: 48, price: "$1.28/hour" },
      { model: "A40", vram: 48, price: "$1.68/hour" },
      { model: "V100 SXM4", vram: 16, price: "$1.00/hour" }
    ];
    
    res.json({ pricing: fallbackData });
  }
});

// Handle all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
