const express = require('express');
const mongoose = require('mongoose');
const bookRouter = require('./routes/book');
const userRouter = require('./routes/user');
const path = require('path');
require ('dotenv').config()


const app = express();

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log('Successfully connected to MongoDB Atlas!');
	})
	.catch((error) => {
		console.log('Unable to connect to MongoDB Atlas!');
	});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.json());

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(cors());

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin,X-Requested-With,Content,Accept,Content-Type,Authorization',
	);
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET,POST,PUT,DELETE,PATCH,OPTIONS',
	);
	next();
});


app.use('/api/books/', bookRouter);
app.use('/api/auth', userRouter);

module.exports = app;
