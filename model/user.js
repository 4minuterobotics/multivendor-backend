const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please enter your name!'],
	},
	email: {
		type: String,
		required: [true, 'Please enter your email!'],
	},
	avatar: {
		public_id: {
			type: String,
			required: true,
		},
		url: {
			type: String,
			required: true,
		},
	},
	phoneNumber: {
		type: Number,
	},
	addresses: [
		{
			country: {
				type: String,
			},
			city: {
				type: String,
			},
			address1: {
				type: String,
			},
			address2: {
				type: String,
			},
			zipCode: {
				type: Number,
			},
			addressType: {
				type: String,
			},
		},
	],
	role: {
		type: String,
		default: 'user',
	},
	password: {
		type: String,
		required: [true, 'Please enter your password'],
		minLength: [1, 'Password should be greater than 4 characters'],
		select: false,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

//  Hash password
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
userSchema.methods.getJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.ACTIVATION_SECRET, {
		expiresIn: process.env.JWT_EXPIRES,
	});
};

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
	console.log('entered compare password. entered password: ', enteredPassword);
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
