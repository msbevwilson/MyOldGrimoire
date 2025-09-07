const sharp = require('sharp');

module.exports = (req, res, next) => {
	if (!req.file) {
		return next();
	}
	{
		const { buffer, originalname } = req.file;
		const filename = 'image' + Date.now() + '.webp';
		req.file.filename = filename;
		console.log('req.file.filename:' + filename);
		try {
			sharp(buffer)
				.webp({ quality: 20 })
				.toFile('./images/' + filename);
			next();
		} catch {
			(error) => res.status(500).json('erreur serveur');
		}
	}
};
