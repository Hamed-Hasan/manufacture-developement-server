const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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


async function run() {
  try {
    await client.connect();
    const userCollection = client.db('developManufacture').collection('user');
    const productCollection = client.db('developManufacture').collection('product');
    const orderCollection = client.db('developManufacture').collection('order');
    const reviewCollection = client.db('developManufacture').collection('review');
  


      //   show display service
      app.get('/product', async (req, res) => {
        const query = {};
        const cursor = productCollection.find(query);
        const result = await cursor.toArray()
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

    // add review 
    app.post('/addReview', verifyJWT, async (req, res) => {
      const body = req.body;
      const result = await reviewCollection.insertOne(body)
      res.send(result);
    })

 // show all reviews 
 app.get('/review',verifyJWT, async (req, res) => {
  const result = await reviewCollection.find().toArray();
  res.send(result)
})

     // verify all booking user & all booking user
     app.get('/order', verifyJWT, async (req, res) => {
      const user = req.query.user;
      console.log(user)
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

   // delete doctor
   app.delete('/order/:user',verifyJWT, async (req, res) => {
    const email = req.params.email;
    const filter = { email: email };
    const result = await orderCollection.deleteOne(filter)
    res.send(result)
  })

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


  }
  finally {

  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(port, () => {
  console.log(`Develop Manufacture App listening on port ${port}`)
})