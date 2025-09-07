const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.userSignup = (req, res, next) => {
	if (!req.body.email || !req.body.password) {
		return res.status(400).json({ error: 'email ou mot de passe manquant' });
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
				.then(() => res.status(201).json({ message: 'utilisateur créé!' }))
				.catch((error) => res.status(400).json({ message: 'requête rejetée' }));
		})
		.catch((error) => res.status(500).json({ message: 'erreur serveur' }));
};

exports.userLogin = (req, res, next) => {
	User.findOne({ email: req.body.email })
		.then((user) => {
			if (!user) {
				return res.status(400).json({ message: 'identifiants incorrects' });
			}
			bcrypt
				.compare(req.body.password, user.password)
				.then((validation) => {
					if (!validation) {
						return res.status(400).json({ message: 'identifiants incorrects' });
					}
					res.status(200).json({
						userId: user._id,
						token: jwt.sign(
							{
								userId: user._id,
							},
							'RANDOM_TOKEN_SECRET',
							{ expiresIn: '24h' },
						),
					});
				})
				.catch((error) => res.status(500).json({ message: 'erreur serveur' }));
		})
		.catch((error) => res.status(500).json({ message: 'erreur serveur' }));
};
