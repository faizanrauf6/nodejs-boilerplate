const nodemailer = require('nodemailer');
const config = require('./config');
const consoleLogger = require('./logging');

//setting up nodemailer
const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.email.smtp.auth.user, // your email address
    pass: config.email.smtp.auth.pass, // your email password or app password if 2FA is enabled
  },
});

const sendMail = (mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        consoleLogger.error(error);
        reject(error);
      } else {
        consoleLogger.info(`Email sent: ${info.response}`);
        resolve(info);
      }
    });
  });
};

module.exports = sendMail;
