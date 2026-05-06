const http = require('http');

const data = JSON.stringify({
  planName: 'sd',
  price: 299,
  dataBenefits: 'f',
  validityDays: 2,
  description: 'ere'
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/operators/1/plans',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log('statusCode:', res.statusCode);

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error('error:', error);
});

req.write(data);
req.end();
