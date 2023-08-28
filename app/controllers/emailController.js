const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const emailSenderOptions = {
  auth: {
    api_key: process.env.EMAIL_SENDER_KEY
  }
};

const emailClient = nodemailer.createTransport(sgTransport(emailSenderOptions));

function sendOrderEmail(order) {
  const { productName, user, userName, phone, price } = order;

  const email = {
    from: process.env.EMAIL_SENDER,
    to: user,
    subject: `Your Order for ${productName} is Confirmed`,
    text: `Your Order for ${productName} is Confirmed`,
    html: `
      <div>
        <p> Hello ${userName}, </p>
        <h3>Your Order for ${productName} is confirmed</h3>
        <p>Looking forward to seeing you on ${phone} at ${price}.</p>
        
        <h3>Our Address</h3>
        <p>From Manufacturing Develop Ltd.</p>
        <p>Bangladesh</p>
        <a href="https://www.google.com/">unsubscribe</a>
      </div>
    `
  };

  emailClient.sendMail(email, function(err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log('Message sent: ', info);
    }
  });
}

module.exports = {
  sendOrderEmail
};
