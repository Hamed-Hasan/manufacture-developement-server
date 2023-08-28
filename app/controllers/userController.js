const { ObjectId } = require('mongodb');
const { getDb } = require('../utils/dbConnect');

async function getAllUsers(req, res) {
  try {
    const db = getDb();
    const users = await db.collection('user').find({}).toArray();
    res.send(users);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred while fetching users.' });
  }
}

async function getUserByEmail(req, res) {
  try {
    const email = req.params.email;
    const db = getDb();
    const user = await db.collection('user').findOne({ email });
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred while fetching user.' });
  }
}

async function updateUser(req, res) {
  try {
    const email = req.params.email;
    const updatedUser = req.body;
    const db = getDb();
    const result = await db.collection('user').updateOne({ email }, { $set: updatedUser });
    if (result.modifiedCount > 0) {
      res.send({ message: 'User updated successfully.' });
    } else {
      res.status(404).send({ message: 'User not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred while updating user.' });
  }
}

module.exports = {
  getAllUsers,
  getUserByEmail,
  updateUser
};
