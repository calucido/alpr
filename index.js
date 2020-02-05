"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const https = require('https');
const child_process = require('child_process');


const app = express();

app.use(bodyParser.urlencoded({extended: true, limit: '8mb'}));

app.get('/', (req, res) => {
  res.setHeader('Feature-Policy', `camera 'self'`);
  return res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
});

app.use(express.static(__dirname + '/frontend'));

app.post('/', (req, res) => {
  let imgPath = path.resolve(__dirname, 'frames',  Math.random().toString(36).substring(2) + Date.now().toString(36) + '.png');
  let img = req.body.img.replace('data:image/png;base64,', '');
  img = img.replace(/ /g, '');
  img = img.replace(/\n/g, '');
  //fs.writeFile(imgPath, img, {encoding: 'base64'}, e => {
	fs.writeFile(imgPath, img, e => {
    if (e) {throw new Error(e)};
    const idProcess = child_process.spawn('alpr', ['-c us', imgPath]);
    idProcess.stdout.on('data', data => {
      console.log(data);
    });
    idProcess.on('close', code => {
      // delete img
    });
    res.sendStatus(200);
  });
});

const sslOptions = {
  key: fs.readFileSync(__dirname + '/ssl/selfsigned.key'),
  cert: fs.readFileSync(__dirname + '/ssl/selfsigned.crt')
};

const httpsApp = https.createServer(sslOptions, app);

httpsApp.listen(8443, () => {
  console.log('ALPR server listening on port 8443.');
});
