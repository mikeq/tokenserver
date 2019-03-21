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
  res.send('Hello World!!');
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
    res.json({ status: 'ok', token: jwt });
  } catch (err) {
    if (/client/gi.test(err.message)) {
      res.status(404).json({ status: 'client not found' });
    } else if (/JSON/g.test(err.message)) {
      res.status(500).json({ status: 'payload is not valid JSON' });
    } else {
      console.error(err);
      res.status(500).json({ status: 'unknown error occurred' });
    }
  }
});

app.post('/verify', async (req, res) => {
  const { client_id, token: jwt } = req.body;
  try {
    const valid = await token.verify(client_id, jwt);
    res.json({ status: 'ok', valid });
  } catch (err) {
    if (/client/gi.test(err.message)) {
      res.status(404).json({ status: 'client not found', valid: false });
    } else {
      res.json({ status: err.message, valid: false });
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
});

process.on('SIGINT', () => {
  console.log('Received SIGINT');
  db.close(err => {
    if (err) console.error('Could not close mongo');
  });
});
