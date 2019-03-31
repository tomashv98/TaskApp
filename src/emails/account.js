const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_KEY);

const sendWelcome = (email, name) => {
  sgMail.send({
    to: email,
    from: "tomashv98@gmail.com",
    subject: "Thanks for joining",
    text: `Welcome to the app, ${name}`
  })
};

const sendFarewell = (email, name) => {
  sgMail.send({
    to: email,
    from: "tomashv98@gmail.com",
    subject: "Goodbye",
    text: `We are sorry that you will stop using our service, ${name}. Feel free to come back anytime`
  })
};

module.exports = {
  sendWelcome,
  sendFarewell
}