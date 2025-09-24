const sharp = require('sharp');

module.exports = (req, res, next) => {
	if (!req.file) {
		return next(); // If there is no file, proceed to the next middleware
	}
	{
		const { buffer, originalname } = req.file; // Destructure buffer and original name from the file
		const filename = 'image' + Date.now() + '.webp'; // Create a filename with the current timestamp
		req.file.filename = filename; // Assign the filename to req.file
		console.log('req.file.filename:' + filename); // Log the filename
		try {
			sharp(buffer) // Use sharp to process the image
				.webp({ quality: 20 }) // Convert to webp format with quality 20
				.toFile('./images/' + filename); // Save the file to the images directory
			next(); // Proceed to the next middleware
		} catch {
			(error) => res.status(500).json('server error'); // Handle any errors by sending a 500 response
		}
	}
};
