module.exports = {
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017',
  tokenDB: process.env.TOKEN_DB || 'token',
  clientCollection: process.env.CLIENT_COLLECTION || 'clients',
  tokenIssuer: process.env.TOKEN_ISSUER || 'token.mikequinn.xyz',
  tokenDefaultExpiry: 1800,
};
