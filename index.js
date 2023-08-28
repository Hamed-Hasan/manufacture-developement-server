const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const compression = require('compression');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(compression());

const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const emailRoutes = require('./routes/emailRoutes');

app.use(authRoutes);
app.use(orderRoutes);
app.use(productRoutes);
app.use(userRoutes);
app.use(emailRoutes); 

app.listen(port, () => {
  console.log(`Develop Manufacture App listening on port ${port}`);
});
