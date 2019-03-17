const jwt = require('jsonwebtoken');
const clipboardy = require('clipboardy');

const db = require('./db');
const config = require('../config');

const generateToken = async (payload, { client_id, private_key }, expiry) => {
  return jwt.sign({ data: payload }, private_key, {
    algorithm: 'RS256',
    expiresIn: expiry || config.tokenDefaultExpiry,
    notBefore: 0,
    issuer: config.tokenIssuer,
    audience: `${client_id}`,
    jwtid: `${client_id}`,
  });
};

const verifyToken = async (token, { client_id, public_key }) => {
  jwt.verify(token, public_key, {
    algorithm: 'RS256',
    audience: `${client_id}`,
    issuer: config.tokenIssuer,
    jwtid: `${client_id}`,
  });

  return true;
};

const generate = async (client_id, client_secret, payload, expiry) => {
  try {
    const client = await db
      .get()
      .collection(config.clientCollection)
      .findOne({
        client_id: client_id,
        client_secret: client_secret,
      });

    if (client === null) throw Error('Client not found');
    const token = await generateToken(payload, client, expiry);
    clipboardy.writeSync(token);
    return token;
  } catch (err) {
    throw err;
  }
};

const verify = async (client_id, token) => {
  try {
    const client = await db
      .get()
      .collection(config.clientCollection)
      .findOne({
        client_id: client_id,
      });

    if (client === null) throw Error('Client not found');
    const valid = await verifyToken(token, client);
    return valid;
  } catch (err) {
    throw err;
  }
};

module.exports = { generate, verify };
