const db = require('./db');

const test = async () => {
  const collection = await db.get().collection('clients');
  const result = await collection.find({ client_tag: 'test' }).toArray();
  console.log(result);
};

module.exports = test;
