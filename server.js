#!/usr/bin/env node
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');

const config = require('./config');
const db = require('./lib/db');
const token = require('./lib/token');

const app = express();
app.use(helmet());
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(bodyParser.json());
const port = process.env.TOKEN_SERVER_PORT || '3005';

app.get('/', (req, res) => {
  res.send('JWT Token Server');
});

app.post('/token', async (req, res) => {
  const {
    client_id,
    client_secret,
    payload,
    token_expiry: expiry = config.tokenDefaultExpiry,
  } = req.body;
  try {
    const data =
      req.get('Content-Type') === 'application/json'
        ? payload
        : JSON.parse(payload);

    const jwt = await token.generate(client_id, client_secret, data, expiry);

    res.json({ token: jwt });
  } catch (err) {
    if (/client/gi.test(err.message)) {
      res.status(500).json({ statusCode: 500, message: 'client not found' });
    } else if (/JSON/g.test(err.message)) {
      res
        .status(500)
        .json({ statusCode: 500, message: 'payload is not valid JSON' });
    } else {
      console.error(err);
      res
        .status(500)
        .json({ statusCode: 500, message: 'unknown error occurred' });
    }
  }
});

app.post('/verify', async (req, res) => {
  const { client_id, token: jwt } = req.body;
  try {
    const valid = await token.verify(client_id, jwt);
    if (valid) {
      res.json({ success: true, message: 'Valid Token' });
    } else {
      res.status(403).json({ success: false, message: 'Invalid Token' });
    }
  } catch (err) {
    if (/client/gi.test(err.message)) {
      res.status(403).json({ success: false, message: 'Invalid Token' });
    } else if (/expired/gi.test(err.message)) {
      res.status(400).json({ success: false, message: 'Token Expired' });
    } else {
      res.status(403).json({ success: false, message: 'Invalid Token' });
    }
  }
});

db.connect(config.mongoUrl, err => {
  if (err) {
    console.log(`Could not connect to mongo on ${config.mongoUrl}`);
    process.exit(1);
  } else {
    app.listen(port, async () => {
      console.log(`🚀 Token server listening on ${port} 🚀`);
    });
  }
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM');
  db.close(err => {
    if (err) console.error('Could not close mongo');
  });
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT');
  db.close(err => {
    if (err) console.error('Could not close mongo');
  });
  process.exit(0);
});
