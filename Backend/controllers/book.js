const Book = require('../models/book');
const fs = require('fs');

exports.getBooks = (req, res) => {
	Book.find()
		.then((books) => res.status(200).json(books))
		.catch((error) => res.status(500).json({ error: 'server error' }));
};

exports.getOneBook = (req, res, next) => {
	const book = Book.findOne({
		_id: req.params.id,
	})
		.then((book) => {
			if (!book) {
				return res.status(400).json({ error: `invalid request` });
			}
			res.status(200).json(book);
		})
		.catch((error) => res.status(500).json({ error: 'server error' }));
};

exports.getBestRating = (req, res) => {
	Book.find()
		.then((books) => {
			books.sort((a, b) => b.averageRating - a.averageRating);
			const bestRating = books.slice(0, 3);
			res.status(200).json(bestRating);
		})
		.catch((error) => res.status(500).json({ error: 'server error' }));
};

exports.createBook = (req, res, next) => {
	try {
		const bookObject = req.file
			? {
					...JSON.parse(req.body.book),
					imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
				}
			: { ...req.body };

		delete bookObject._id;
		delete bookObject.userId;
		const book = new Book({
			...bookObject,
			userId: req.auth.userId,
		});
		book
			.save()
			.then(() => res.status(201).json({ message: 'book created' }))
			.catch((error) => res.status(400).json({ error: 'invalid request' }));
	} catch {
		return res.status(400).json({ error: 'invalid request' });
	}
};

exports.modifyBook = async (req, res, next) => {
	try {
		const bookObject = req.file
			? {
					...JSON.parse(req.body.book),
					imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
				}
			: { ...req.body };

		delete bookObject.userId;

		const book = await Book.findOne({ _id: req.params.id });
		if (!book) {
			return res.status(400).json({ error: 'invalid request' });
		}
		if (book.userId !== req.auth.userId) {
			return res.status(400).json({ error: 'invalid request' });
		}

		await Book.updateOne(
			{ _id: req.params.id },
			{ ...bookObject, _id: req.params.id }
		);

		const updatedBook = await Book.findOne({ _id: req.params.id });
		if (!updatedBook) {
			return res.status(400).json({ message: 'invalid request' });
		}
		res.status(200).json({ message: 'book modified' });
	} catch (error) {
		res.status(500).json({ error: 'server error' });
	}
};

exports.deleteBook = (req, res) => {
	try {
		Book.findOne({
			_id: req.params.id,
		})
			.then((book) => {
				if (!book) {
					return res.status(400).json({ error: 'invalid request' });
				}
				if (book.userId !== req.auth.userId) {
					return res.status(400).json({ error: 'invalid request' });
				} else {
					const filename = book.imageUrl.split('/images/')[1];
					fs.unlink(`images/${filename}`, () => {
						book
							.deleteOne()
							.then(() => res.status(200).json({ message: 'book deleted' }))
							.catch((error) =>
								res.status(500).json({ message: 'server error' }),
							);
					});
				}
			})
			.catch((error) => res.status(500).json({ error: 'server error' }));
	} catch {
		return res.status(500).json({ error: 'server error' });
	}
};

exports.rateBook = async (req, res, next) => {
   // Check that the user has not already rated the book
   const existingRating = await Book.findOne({
    _id: req.params.id,
    "ratings.userId": req.body.userId
  })
  if (existingRating) {
    return res.status(400).json({ message: 'User has already rated this book' })
  }

  // Check that the rating is a number between 0..5 included
  if(!(req.body.rating  >= 0) && !(req.body.rating  <= 5) && (typeof req.body.rating === 'number')){
    return res.status(500).json({ message: 'Grade is not between 0 and 5 included or is not a number' })
  }

  try {
    // Retrieves the book to rate according to the id of the request
    const book = await Book.findOne({ _id: req.params.id })
    if (!book) {
      return res.status(404).json({ message: 'Book not found' })
    }

    // Add a new rating to the ratings array of the book
    book.ratings.push({ userId : req.body.userId, grade: req.body.rating })

    // Save the book to MongoDB, averageRating will be up to date on save
    await book.save()
    res.status(200).json(book)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'An error has occurred' })
  }
}
