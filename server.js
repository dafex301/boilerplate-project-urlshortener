require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();
const bodyParser = require('body-parser');

// Setup bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to mongodb
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

// Create schema
const Schema = mongoose.Schema;
const urlSchema = new Schema({
	original_url: String,
	short_url: Number,
});

// Create model
const Url = mongoose.model('Url', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
	res.json({ greeting: 'hello API' });
});

// Handle post
app.post('/api/shorturl', (req, res) => {
	const { url } = req.body;
	const REPLACE_REGEX = /^https?:\/\//i;
	const urlToShorten = url.replace(REPLACE_REGEX, '');
	if (!url) {
		res.status(400).send('No url provided');
	} else {
		if (REPLACE_REGEX.test(url)) {
			dns.lookup(urlToShorten, (err, address, family) => {
				if (err) {
					console.log(url);
					console.log('masuk error');
					res.json({
						error: 'invalid URL',
					});
				} else {
					console.log('masuk else');
					Url.findOne({ original_url: url }, (err, result) => {
						if (err) {
							res.status(500).send('Error');
						} else if (result) {
							res.json({
								original_url: url,
								short_url: result.short_url,
							});
						} else {
							const newUrl = new Url({
								original_url: url,
								short_url: Math.floor(Math.random() * 100000),
							});
							newUrl.save((err, result) => {
								if (err) {
									res.status(500).send('Error');
								} else {
									res.json({
										original_url: url,
										short_url: result.short_url,
									});
								}
							});
						}
					});
				}
			});
		} else {
			console.log(url);
			console.log('masuk else paling bawah');
			// res.status(400).send('Invalid url');
			res.json({ error: 'Invalid url' });
		}
	}
});

// Handle GET request
app.get('/api/shorturl/:short_url', (req, res) => {
	const { short_url } = req.params;
	Url.findOne({ short_url: short_url }, (err, result) => {
		if (err) {
			res.status(500).send('Error');
		} else if (result) {
			res.status(301).redirect(result.original_url);
		} else {
			res.status(400).send('Invalid short url');
		}
	});
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
