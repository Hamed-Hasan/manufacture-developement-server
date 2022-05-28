const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.gtdem.mongodb.net:27017,cluster0-shard-00-01.gtdem.mongodb.net:27017,cluster0-shard-00-02.gtdem.mongodb.net:27017/?ssl=true&replicaSet=atlas-5nn6hp-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// verifyJWT
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}





const emailSenderOptions = {
  auth: {
    api_key: process.env.EMAIL_SENDER_KEY
  }
}

const emailClient = nodemailer.createTransport(sgTransport(emailSenderOptions));

function sendOrderEmail(order){
  const { productName,  user,  userName,  phone,  price} = order;

  var email = {
    from: process.env.EMAIL_SENDER,
    to: productName,
    subject: `Your Order for ${userName} is on ${phone} at ${price} is Confirmed`,
    text: `Your Order for ${user} is on ${phone} at ${price} is Confirmed`,
    html: `
      <div>
        <p> Hello ${userName}, </p>
        <h3>Your Order for ${userName} is confirmed</h3>
        <p>Looking forward to seeing you on ${phone} at ${price}.</p>
        
        <h3>Our Address</h3>
        <p>From Manufacturing Develop Ltd.</p>
        <p>Bangladesh</p>
        <a href="https://www.google.com/">unsubscribe</a>
      </div>
    `
  };

  emailClient.sendMail(email, function(err, info){
    if (err ){
      console.log(err);
    }
    else {
      console.log('Message sent: ', info);
    }
});

}







async function run() {
  try {
    await client.connect();
    const userCollection = client.db('developManufacture').collection('user');
    const productCollection = client.db('developManufacture').collection('product');
    const orderCollection = client.db('developManufacture').collection('order');
    const reviewCollection = client.db('developManufacture').collection('review');
    const paymentCollection = client.db('developManufacture').collection('payments');

    // verifyAdmin
    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({ email: requester });
      if (requesterAccount.isAdmin === true) {
        next();
      }
      else {
        res.status(403).send({ message: 'forbidden' });
      }
    }

// create payment method for stripe 
app.post('/create-payment-intent', verifyJWT, async(req, res) =>{
  const service = req.body;
  const price = service.price;
  const amount = price*100;
  const paymentIntent = await stripe.paymentIntents.create({
    amount : amount,
    currency: 'usd',
    payment_method_types:['card']
  });
  res.send({clientSecret: paymentIntent.client_secret})
});


    // update booking for stripe
    app.patch('/order/:id', async(req, res) =>{
      const id  = req.params.id;
      const payment = req.body;
      const filter = {_id: ObjectId(id)};
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId
        }
      }

      const result = await paymentCollection.insertOne(payment);
      const updatedBooking = await orderCollection.updateOne(filter, updatedDoc);
      // sendPaymentConfirmationEmail(payment)
      res.send({updatedBooking: updatedBooking, result: result});
    })





      //   show display service
      app.get('/product', async (req, res) => {
        const query = {};
        const cursor = productCollection.find(query);
        const result = await cursor.toArray()
        res.send(result);
    })

    // add new user in home page 
    app.post('/addNewOrder', async (req, res) => {
      const newService = req.body;
      const result = await productCollection.insertOne(newService);
      res.send(result);
  })

      // find single service
      app.get('/product/:id', async (req, res) => {
        const id = req.params.id;
        const query = {
            _id: ObjectId(id)
        }
        const service = await productCollection.findOne(query);
        res.send(service);
    })


    // create Order 
    app.post('/order', async (req, res) => {
      const order = req.body
      const result = await orderCollection.insertOne(order);
      res.send({ success: true, result });
  })

  //   app.post('/order', async (req, res) => {
  //     const order = req.body;
  //     const query = { productName: order.productName, price: order.price, user: order.user, userName: order.userName, orderQuantity: order.orderQuantity, phone: order.phone, address: order.address}
  //     const result = await orderCollection.insertOne(query);
  //     sendOrderEmail(order)
  //     res.send({ success: true, result });
  // })

  // add single item to database for review
  app.post("/add-review",verifyJWT,verifyAdmin, async (req, res) => {
    const newItem = req.body;
    
    res.send({ result: "data received!" });
    const result = await reviewCollection.insertOne(newItem);
    console.log("review Inserted. ID: ", result.insertedId);
  });

// load all item from database for review
app.get("/reviews", async (req, res) => {
  const query = {};
  const cursor = reviewCollection.find(query);
  const allProduct = await cursor.toArray();
  res.send(allProduct);
});

     // verify all booking user & all booking user
     app.get('/order', verifyJWT, async (req, res) => {
      const user = req.query.user;
 
      const decodedEmail = req.decoded.email;
      if (user === decodedEmail) {
        const query = { user: user };
        const bookings = await orderCollection.find(query).toArray();
        return res.send(bookings);
      }
      else {
        return res.status(403).send({ message: 'forbidden access' });
      }
    })

     // order verifyJWT & single order show
     app.get('/order/:id', verifyJWT, async(req, res) =>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const booking = await orderCollection.findOne(query);
      res.send(booking);
    })

   // delete doctor
   app.delete('/order/:user',verifyJWT, async (req, res) => {
    const email = req.params.email;
    const filter = { email: email };
    const result = await orderCollection.deleteOne(filter)
    res.send(result)
  })


     // load all users from database
     app.get("/users", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const allUsers = await cursor.toArray();
      res.send(allUsers);
    });


   // load single user using email
   app.get("/userInfo/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email };
    const product = await userCollection.findOne(query);
    res.send(product);
  });

  // update a user
  app.put("/newUser/:email", async (req, res) => {
    const email = req.params.email;
    const user = req.body;
    const filter = { email };
    const options = { upsert: true };
   
    const updatedDoc = {
      $set: {
        ...user,
      },
    };
    const result = await userCollection.updateOne(
      filter,
      updatedDoc,
      options
    );
    res.send(result);
  });

//  users login and signIn go to signIn send user to db with put
app.put('/user/:email', async (req, res) => {
  const email = req.params.email;
  const user = req.body;
  const filter = { email: email };
  const options = { upsert: true };
  const updateDoc = {
    $set: user,
  };
  const result = await userCollection.updateOne(filter, updateDoc, options);
  // res.send(result);
  const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
  res.send({ result, token });

})
        // delete from manage item
        app.delete('/manage/:id', async (req, res) => {
          const id = req.params.id;
          const query = {
              _id: ObjectId(id)
          }
          const result = await productCollection.deleteOne(query);
          res.send(result);
      })

  }
  finally {

  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World Manufacturing Development')
})

app.listen(port, () => {
  console.log(`Develop Manufacture App listening on port ${port}`)
})