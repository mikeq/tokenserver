const mongoClient = require('mongodb').MongoClient;

const config = require('../config');

const state = {
  db: null,
  conn: null,
};

const connect = async (url, done) => {
  if (state.db) return done();

  try {
    const client = await mongoClient.connect(url, {
      useNewUrlParser: true,
    });
    const db = await client.db(config.tokenDB);
    state.db = db;
    state.conn = client;
    done();
  } catch (err) {
    done(err);
  }
};

const get = () => {
  return state.db;
};

const close = async done => {
  if (state.conn) {
    try {
      await state.conn.close();
      state.db = null;
      state.mode = null;
      state.conn = null;
    } catch (err) {
      done(err);
    }
  }
};

module.exports = { connect, get, close };
