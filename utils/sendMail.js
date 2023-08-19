const nodemailer = require('nodemailer');

// config
require('dotenv').config({
	path: 'config/.env',
});

// const sendMail = async (options) => {
// 	const transporter = nodemailer.createTransport({
// 		host: process.env.SMPT_HOST,
// 		port: process.env.SMPT_PORT,
// 		service: process.env.SMPT_SERVICE,
// 		auth: {
// 			user: process.env.SMPT_MAIL,
// 			pass: process.env.SMPT_PASSWORD,
// 		},
// 	});

// 	const mailOptions = {
// 		from: process.env.SMPT_MAIL,
// 		to: options.email,
// 		subject: options.subject,
// 		text: options.message,
// 	};

// 	await transporter.sendMail(mailOptions);
// };

const sendMail = async (options) => {
	const transporter = nodemailer.createTransport({
		// host: process.env.SMPT_HOST,
		// port: process.env.SMPT_PORT,
		service: 'gmail',
		auth: {
			user: 'lawrence.william86@gmail.com',
			pass: 'dxlgpccjjtelfzbj',
		},
	});

	const mailOptions = {
		from: 'lawrence.william86@gmail.com',
		to: options.email,
		subject: options.subject,
		text: options.message,
	};

	await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
