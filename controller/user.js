const express = require('express');
const path = require('path');
const User = require('../model/user');
const cloudinary = require('cloudinary').v2;
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const sendToken = require('../utils/jwtToken');
const { upload } = require('../multer');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// config
require('dotenv').config({
	path: 'config/.env',
});

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// create user
router.post('/create-user', async (req, res, next) => {
	const { name, email, password, avatar } = req.body;
	try {
		const userEmail = await User.findOne({ email });

		if (userEmail) {
			return next(new ErrorHandler('User already exists', 400));
		}

		//log form
		console.log('1: form from frontend: ', req.body);

		//log form photo data
		console.log('2: form photo data: ', req.body.avatar);
		console.log('end of form data');

		const cloudinaryStuff = await cloudinary.uploader.upload(req.body.avatar, {
			folder: 'avatars',
		});

		//log myCloud
		console.log('myCloud data: ', cloudinaryStuff);
		const user = {
			name: name,
			email: email,
			password: password,
			// avatar: cloudinaryStuff.url,
			avatar: {
				public_id: cloudinaryStuff.public_id,
				url: cloudinaryStuff.secure_url,
			},
		};

		const activation_token = createActivationToken(user);

		console.log('activation token: ', activation_token);

		const activationUrl = `http://localhost:5173/activation?jwt=${activation_token}`;

		console.log('activation url: ', activationUrl);
		try {
			await sendMail({
				email: user.email,
				subject: 'Activate your account',
				message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
			});

			console.log('mail being sent');

			console.log('activation secret: ', process.env.ACTIVATION_SECRET);

			res.status(201).json({
				success: true,
				message: `Please check your email: ${user.email} to activate your account!`,
			});
		} catch (error) {
			return next(new ErrorHandler(error.message, 500));
		}

		console.log('user: ', user);
	} catch (error) {
		return next(new ErrorHandler(error.message, 400));
	}
});

// create activation token
const createActivationToken = (user) => {
	return jwt.sign(user, process.env.ACTIVATION_SECRET, {
		expiresIn: '5m',
	});
};

// activate user
router.post(
	'/activation',
	catchAsyncErrors(async (req, res, next) => {
		try {
			const { activation_token } = req.body;

			const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

			if (!newUser) {
				return next(new ErrorHandler('Invalid token', 400));
			}

			const { name, email, password, avatar } = newUser;

			console.log('newUser: ', newUser);
			let userSearchResult = await User.findOne({ email });
			console.log('user: ', userSearchResult);
			console.log('made it here');
			if (userSearchResult) {
				console.log('user exists already. here they are: ', userSearchResult);
				return next(new ErrorHandler('User already exists', 400));
			}

			console.log('creating user in database');
			let user;
			saveUser();
			async function saveUser() {
				user = await User.create({
					name,
					email,
					avatar,
					password,
				});
				console.log('just created user. here they are: ', user);

				// user = new User({
				// 	name,
				// 	email,
				// 	avatar,
				// 	password,
				// });
				// user.save().then(() => console.log('just created user. here they are: ', user));

				sendToken(user, 201, res);
				console.log('token sent');
			}
		} catch (error) {
			console.log('ERROR, the erro was: ', error);
			return next(new ErrorHandler(error.message, 500));
		}
	})
);

// login user
router.post(
	'/login-user',
	catchAsyncErrors(async (req, res, next) => {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return next(new ErrorHandler('Please provide the all fields!', 400));
			}

			const user = await User.findOne({ email }).select('+password');
			console.log('user: ', user);
			if (!user) {
				return next(new ErrorHandler("User doesn't exists!", 400));
			}

			const isPasswordValid = await user.comparePassword(password);
			console.log('password comparison: ', isPasswordValid);
			if (!isPasswordValid) {
				return next(new ErrorHandler('Please provide the correct information', 400));
			}

			sendToken(user, 201, res);
		} catch (error) {
			return next(new ErrorHandler(error.message, 500));
		}
	})
);

// load user
router.get(
	'/getuser',
	isAuthenticated,
	catchAsyncErrors(async (req, res, next) => {
		try {
			const user = await User.findById(req.user.id);

			if (!user) {
				return next(new ErrorHandler("User doesn't exists", 400));
			}

			res.status(200).json({
				success: true,
				user,
			});
		} catch (error) {
			return next(new ErrorHandler(error.message, 500));
		}
	})
);

module.exports = router;
