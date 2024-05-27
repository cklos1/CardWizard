require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;
const ebayOAuthToken = process.env.EBAY_OAUTH_TOKEN;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public/src')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/src', 'index.html'));
});

app.post('/search', (req, res) => {
    let { keywords, cardCondition, listingType, negativeKeywords } = req.body;

    if (cardCondition === 'ungraded') {
        keywords += ' -PSA -SGC -BGS -CGC -HGA -GMA -ISA';
    }

    if (negativeKeywords) {
        keywords += ' ' + negativeKeywords.split(' ').map(kw => `-${kw}`).join(' ');
    }

    let listingTypeFilter = '';
    if (listingType === 'auction') {
        listingTypeFilter = '&filter=buyingOptions:{AUCTION}';
    } else if (listingType === 'fixed') {
        listingTypeFilter = '&filter=buyingOptions:{FIXED_PRICE}';
    }

    const searchUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(keywords)}${listingTypeFilter}&limit=50`;

    console.log(`Sending request to eBay with URL: ${searchUrl}`);

    axios.get(searchUrl, {
        headers: {
            'Authorization': `Bearer ${ebayOAuthToken}`,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        res.json({ results: response.data.itemSummaries });
    }).catch(error => {
        console.error('Error fetching data from eBay:', error.response ? error.response.data : error.message);
        res.json({ error: 'Error fetching data from eBay' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
