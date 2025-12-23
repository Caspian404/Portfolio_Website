const fs = require('fs');
const crypto = require('crypto');

// Generate self-signed certificate
const key = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Create a simple self-signed certificate
const cert = crypto.createCertificate({
  publicKey: key.publicKey,
  privateKey: key.privateKey,
  selfSigned: true,
  days: 365,
  country: 'US',
  organization: 'Local Dev',
  commonName: 'localhost'
});

fs.writeFileSync('localhost+2-key.pem', key.privateKey);
fs.writeFileSync('localhost+2.pem', cert);
console.log('SSL certificates generated!');
