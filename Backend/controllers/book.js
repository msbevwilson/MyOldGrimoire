const Book = require('../models/book');
const fs = require('fs');

exports.getBooks = (req, res) => {
	Book.find()
		.then((books) => res.status(200).json(books))
		.catch((error) => res.status(500).json({ error: 'erreur serveur' }));
};
exports.getOneBook = (req, res, next) => {
	const book = Book.findOne({
		_id: req.params.id,
	})
		.then((book) => {
			if (!book) {
				return res.status(400).json({ error: `requête invalide` });
			}
			res.status(200).json(book);
		})
		.catch((error) => res.status(500).json({ error: 'erreur serveur' }));
};
exports.getBestRating = (req, res) => {
	Book.find()
		.then((books) => {
			books.sort((a, b) => b.averageRating - a.averageRating);
			const bestrating = books.slice(0, 3);
			res.status(200).json(bestrating);
		})
		.catch((error) => res.status(500).json({ error: 'erreur serveur' }));
};
exports.createBook = (req, res, next) => {
	if (!req.body.book) {
		return res.status(400).json({ error: 'requête invalide' });
	}
	if (!req.file) {
		return res.status(400).json({ error: 'requête invalide' });
	}
	try {
		const bookObject = JSON.parse(req.body.book);
		delete bookObject.userId;
		const book = new Book({
			...bookObject,
			userId: req.auth.userId,
			imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
			ratings: [
				{
					userId: req.auth.userId,
					grade: bookObject.ratings[0].grade,
				},
			],
			averageRating: bookObject.ratings[0].grade,
		});
		book
			.save()
			.then(() => res.status(201).json({ message: 'Livre créé avec succès' }))
			.catch((error) => res.status(500).json({ error: 'erreur serveur' }));
	} catch {
		(error) => res.status(500).json({ error: 'erreur serveur' });
	}
};
exports.modifyBook = (req, res, next) => {
	try {
		const bookObject = req.file
			? {
					...JSON.parse(req.body.book),
					imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
				}
			: { ...req.body };

		delete bookObject.userId;
		Book.findOne({ _id: req.params.id })
			.then((book) => {
				if (!book) {
					return res.status(400).json({ error: 'requête invalide' });
				}
				if (book.userId != req.auth.userId) {
					return res.status(400).json({ error: 'requête invalide' });
				} else {
					if (req.file) {
						const oldFilename = book.imageUrl.split(`images/`)[1];
						fs.unlink(`images/${oldFilename}`, (err) => {
							console.log('erreur lors de la suppression');
						});
					}
					Book.updateOne(
						{
							_id: req.params.id,
						},
						{ ...bookObject, _id: req.params.id },
					)
						.then(() => {
							return Book.findOne({ _id: req.params.id });
						})
						.then((updatedBook) => {
							if (!updatedBook) {
								return res.status(400).json({ message: 'requête invalide' });
							}
							res.status(200).json({ message: 'livre modifié' });
						})
						.catch((error) =>
							res.status(500).json({ error: 'erreur serveur' }),
						);
				}
			})
			.catch((error) => res.status(500).json({ error: 'erreur serveur' }));
	} catch {
		return res.status(400).json({ error: 'requête invalide' });
	}
};
exports.deleteBook = (req, res) => {
	try {
		Book.findOne({
			_id: req.params.id,
		})
			.then((book) => {
				if (!book) {
					return res.status(400).json({ error: 'requête invalide' });
				}
				if (book.userId != req.auth.userId) {
					return res.status(400).json({ error: 'requête invalide' });
				} else {
					const filename = book.imageUrl.split('/images/')[1];
					fs.unlink(`images/${filename}`, () => {
						book
							.deleteOne()
							.then(() => res.status(200).json({ message: 'livre effacé' }))
							.catch((error) =>
								res.status(500).json({ message: 'erreur serveur' }),
							);
					});
				}
			})
			.catch((error) => res.status(500).json({ error: 'erreur serveur' }));
	} catch {
		return res.status(500).json({ error: 'erreur serveur' });
	}
};
exports.rateBook = (req, res) => {
	Book.findOne({ _id: req.params.id })
		.then((book) => {
			if (!book) {
				return res.status(400).json({ error: 'requête invalide' });
			}
			const rating = { userId: req.body.userId, grade: req.body.rating };
			const ratings = book.ratings;
			if (ratings.find((rate) => rate.userId === req.body.userId)) {
				return res.status(400).json({ error: 'requête invalide' });
			}
			ratings.push(rating);
			const averageRating =
				ratings.reduce((acc, current) => {
					return acc + current.grade;
				}, 0) / ratings.length;

			Book.findOneAndUpdate(
				{
					_id: req.params.id,
				},
				{
					ratings: ratings,
					averageRating: averageRating,
				},
				{ new: true, runValidators: true },
			)
				.then((book) => {
					res.status(200).json(book);
					console.log(`${book.title}: ${book.averageRating}`);
				})
				.catch((error) => res.status(400).json({ error: 'requête invalide' }));
		})
		.catch((error) => res.status(500).json({ error: 'erreur serveur' }));
};
