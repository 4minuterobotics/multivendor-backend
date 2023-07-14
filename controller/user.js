const express = require('express');
const path = require('path');
const User = require('../model/user');
const cloudinary = require('cloudinary').v2;
const ErrorHandler = require('../utils/ErrorHandler');
const { upload } = require('../multer');
const router = express.Router();

// router.post('/create-user', upload.single('file'), async (req, res, next) => {
// 	const { name, email, password } = req.body;
// 	const userEmail = await User.findOne({ email });
// 	if (userEmail) {
// 		return next(new ErrorHandler('User already exists', 400));
// 	}

// 	const filename = req.file.filename;
// 	const fileUrl = path.join(filename);
// 	const user = {
// 		name: name,
// 		email: email,
// 		password: password,
// 		avatar: fileUrl,
// 	};

// 	console.log(user);
// });

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
		// const userEmail = await User.findOne({ email });

		// if (userEmail) {
		// 	return next(new ErrorHandler('User already exists', 400));
		//

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

		res.status(201).json({
			success: true,
			message: `Please check your email: ${user.email} to activate your account!`,
		});

		console.log(user);
	} catch (error) {
		return next(new ErrorHandler(error.message, 400));
	}
});

module.exports = router;
