// Handling post for the TEST

app.post('/api/shorturl', (req, res) => {
	const { url } = req.body;
	const REPLACE_REGEX = /^https?:\/\//i;
	const urlToShorten = url.replace(REPLACE_REGEX, '');
	if (!url) {
		res.status(400).send('No url provided');
	} else {
		if (REPLACE_REGEX.test(url)) {
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
		} else {
			res.json({ error: 'Invalid url' });
		}
	}
});
