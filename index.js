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




async function run() {
  try {
    await client.connect();
    const userCollection = client.db('developManufacture').collection('user');
    const productCollection = client.db('developManufacture').collection('product');
  


      //   show display service
      app.get('/product', async (req, res) => {
        const query = {};
        const cursor = productCollection.find(query);
        const result = await cursor.toArray()
        res.send(result);
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