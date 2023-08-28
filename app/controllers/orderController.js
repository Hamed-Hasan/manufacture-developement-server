const { ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDb } = require('../utils/dbConnect');

async function createPaymentIntent(req, res) {
  try {
    const service = req.body;
    const price = service.price;
    const amount = price * 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      payment_method_types: ['card']
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
}

async function updateOrder(req, res) {
  try {
    const id = req.params.id;
    const payment = req.body;
    const filter = { _id: ObjectId(id) };
    const updatedDoc = {
      $set: {
        paid: true,
        transactionId: payment.transactionId
      }
    };

    const db = getDb();
    const paymentResult = await db.collection('payments').insertOne(payment);
    const updatedBooking = await db.collection('order').updateOne(filter, updatedDoc);

    res.send({ updatedBooking: updatedBooking, result: paymentResult });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
}

module.exports = {
  createPaymentIntent,
  updateOrder
};
