const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// 1 - GET endpoint returning status code 200
app.get('/status200', (req, res) => {
    res.status(200).send('Status code 200');
});


// 2 - POST endpoint to receive a JSON array and return the total number of elements
app.post('/queue', (req, res) => {
    const queue = req.body;

    // Check if the request body is an array
    if (!Array.isArray(queue)) {
        return res.status(400).json({ error: 'Invalid JSON format. Expected an array.' });
    }

    // Return the total number of elements in the queue
    res.json({ total_elements: queue.length });
});

// 3 - POST endpoint to receive a JSON array and return it sorted by certain conditions
app.post('/queue-sorted', (req, res) => {
    const queue = req.body;

    // Check if the request body is an array
    if (!Array.isArray(queue)) {
        return res.status(400).json({ error: 'Invalid JSON format. Expected an array.' });
    }

    items = queue;

    // Adding score to each item
    items.forEach(item => {
        item.score = calculateScore(item);
    });

    // Sorting items based on score
    const sortedItems = items.sort((a, b) => b.score - a.score);

    // OPTIONAL - Displaying sorted items without score
    sortedItems.forEach(item => {
        delete item.score;
        console.log(item);
    });

    // Add the new attribute "previsao_consumo" to each element
    const modifiedItems = sortedItems.map(item => {
        return {
            ...item,
            previsao_consumo: item.quantidade * 5 
        };
    });

    res.json(modifiedItems);
});

// 4 - GET endpoint to get and return the data
app.get('/consumedata', async (req, res) => {
    const url = 'https://pastebin.pl/view/raw/8fced5f8';

    try {
        // Get data from the URL using axios
        const response = await axios.get(url);

        // Check if the response is successful
        if (response.status !== 200) {
            throw new Error('Failed to get data');
        }

        // Return the data as JSON
        res.json(response.data);
    } catch (error) {
        console.error('Error geting data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// Global Functions

// Function to calculate score for each item
function calculateScore(item) {
    let score = 0;

    // Quantity (50%)
    score += item.quantidade * 0.4;

    // Payment weighting (30%)
    switch (item.condicao_pagamento) {
        case "DIN":
            score += 5 * 0.4;
            break;
        case "30":
            score += 4 * 0.4;
            break;
        case "R60":
            score += 3 * 0.4;
            break;
        case "90":
            score += 2 * 0.4;
            break;
        case "120":
            score += 1 * 0.4;
            break;
    }

    // Country (20%)
    if (item.pais === "PORT") {
        score += 1 * 0.2;
    }

    return score;
}