const axios = require('axios');
const http = require('http');
const https = require('https');

// Reusable HTTP & HTTPS agents with Keep-Alive connection pooling
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 50,
  keepAliveMsecs: 30000
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  keepAliveMsecs: 30000
});

// Pre-configured Axios instance with default Keep-Alive agents and strict 2.5s timeout
const httpClient = axios.create({
  httpAgent,
  httpsAgent,
  timeout: 2500
});

module.exports = {
  httpClient,
  httpAgent,
  httpsAgent
};
