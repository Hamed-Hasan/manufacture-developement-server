const { getDb } = require('../utils/dbConnect');

async function verifyAdmin(req, res, next) {
  const decodedEmail = req.decoded.email;
  const userCollection = getDb().collection('user');

  try {
    const user = await userCollection.findOne({ email: decodedEmail });
    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).send({ message: 'Forbidden access' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Internal server error' });
  }
}

module.exports = {
  verifyAdmin
};
