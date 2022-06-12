const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.SMTPGMAIL,
    pass: process.env.SMTPPASSWORD,
  },
});
transporter.verify().then(console.log).catch(console.error);

module.exports = transporter