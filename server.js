const app = require('./app');
const connectDatabase = require('./db/Database');
// const cloudinary = require('cloudinary').v2;

// Handling uncaught Exception
process.on('uncaughtException', (err) => {
	console.log(`Error: ${err.message}`);
	console.log(`shutting down the server for handling uncaught exception`);
});

// config
if (process.env.NODE_ENV !== 'PRODUCTION') {
	require('dotenv').config({
		path: 'config/.env',
	});
}

//connect db
connectDatabase();

// cloudinary.config({
// 	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// 	api_key: process.env.CLOUDINARY_API_KEY,
// 	api_secret: process.env.CLOUDINARY_API_SECRET,
// });

//crete server
const server = app.listen(process.env.PORT, () => {
	console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

//unhandle promise rejection
process.on('unhandledRejection', (err) => {
	console.log(`Shutting down the server for ${err.message}`);
	console.log(`shutting down the server for unhandled promise rejection`);

	server.close(() => {
		process.exit(1);
	});
});

// "bcrypt": "^5.1.0",
// "cookie-parser": "^1.4.6",
// "dotenv": "^16.3.1",
// "express": "^4.18.2",
// "jsonwebtoken": "^9.0.0",
// "mongoose": "^7.3.1",
// "nodemailer": "^6.9.3"

// "nodemon": "^2.0.22"
