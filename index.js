const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());

let otcPrice = "Loading...";

async function startScraper() {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://qxbroker.com/ar/trade', { waitUntil: 'networkidle2' });

    setInterval(async () => {
      try {
        const price = await page.evaluate(() => {
          const el = document.querySelector('.current-price') || document.querySelector('[class*="price"]');
          return el ? el.innerText : null;
        });
        if (price) otcPrice = price;
      } catch (e) {}
    }, 500);
  } catch (err) {
    console.error("Error:", err);
  }
}

app.get('/price', (req, res) => {
  res.json({ price: otcPrice });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScraper();
});
