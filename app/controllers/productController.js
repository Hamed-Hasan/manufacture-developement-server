const { ObjectId } = require('mongodb');
const { getDb } = require('../utils/dbConnect');

async function getAllProducts(req, res) {
  try {
    const db = getDb();
    const productCollection = db.collection('product');
    
    const products = await productCollection.find({}).toArray();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getProductById(req, res) {
  try {
    const productId = req.params.id;
    const db = getDb();
    const productCollection = db.collection('product');
    
    const product = await productCollection.findOne({ _id: ObjectId(productId) });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllProducts,
  getProductById
};
