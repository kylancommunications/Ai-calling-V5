import https from 'https';

const data = JSON.stringify({
  token: '26f1915fde968afe7d89fbbced89caa59c63cc9a9e05018f5550ea72',
  type: 'signup',
  email: 'stancemarketingllc@gmail.com'
});

const options = {
  hostname: 'wllyticlzvtsimgefsti.supabase.co',
  port: 443,
  path: '/auth/v1/verify',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbHl0aWNsenZ0c2ltZ2Vmc3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTA0MTYsImV4cCI6MjA2NTE4NjQxNn0.V2pQNPbCBCjw9WecUFE45dIswma0DjB6ikLi9Kdgcnk',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  res.on('data', (d) => {
    console.log('Response:', d.toString());
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(data);
req.end();