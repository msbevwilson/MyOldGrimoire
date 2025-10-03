const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.userSignup = (req, res, next) => {
	if (!req.body.email || !req.body.password) {
		return res.status(400).json({ error: 'email or password missing' });
	}
	bcrypt
		.hash(req.body.password, 10)
		.then((hash) => {
			const user = new User({
				email: req.body.email,
				password: hash,
			});
			user
				.save()
				.then(() => res.status(201).json({ message: 'user created!' }))
				.catch((error) => res.status(400).json({ message: 'request rejected' }));
		})
		.catch((error) => res.status(500).json({ message: 'server error' }));
};

exports.userLogin = (req, res, next) => {
	User.findOne({ email: req.body.email })
		.then((user) => {
			if (!user) {
				return res.status(400).json({ message: 'invalid credentials' });
			}
			bcrypt
				.compare(req.body.password, user.password)
				.then((validation) => {
					if (!validation) {
						return res.status(400).json({ message: 'invalid credentials' });
					}
					res.status(200).json({
						userId: user._id,
						token: jwt.sign( 
							{
								userId: user._id,
							},
							process.env.RANDOM_TOKEN_SECRET,
							{ expiresIn: '24h' },
						),
					});
				})
				.catch((error) => res.status(500).json({ message: 'server error' }));
		})
		.catch((error) => res.status(500).json({ message: 'server error' }));
};
