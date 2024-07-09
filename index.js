const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const shortid = require('shortid');

const app = express();
const PORT = 3007;

mongoose.connect('mongodb://localhost:27017/urlshortener', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

const Url = require('./models/url');

app.use(bodyParser.json());

app.post('/shorten', async (req, res) => {
    try {
        const { originalUrl } = req.body;
        const urlCode = shortid.generate();

        let url = await Url.findOne({ originalUrl });

        if (url) {
            res.json(url);
        } else {
            const shortUrl = `http://localhost:${PORT}/${urlCode}`;
            url = new Url({
                originalUrl,
                shortUrl,
                urlCode,
            });

            await url.save();
            res.json(url);
        }
    } catch (error) {
        console.error('Error during shorten URL:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/:code', async (req, res) => {
    try {
        const url = await Url.findOne({ urlCode: req.params.code });

        if (url) {
            res.redirect(url.originalUrl);
        } else {
            res.status(404).json('No URL found');
        }
    } catch (error) {
        console.error('Error during URL redirection:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
