"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
//const openalpr = require('node-openalpr');
const fs = require('fs');
const path = require('path');

app.use(bodyParser.urlencoded({extended: true, limit: '8mb'}));

app.get('/', (req, res) => {return res.sendfile('default.html');});

app.post('/', (req, res) => {
  let imgPath = path.resolve(__dirname, 'frames',  Math.random().toString(36).substring(2) + Date.now().toString(36));
  const img = req.body.img.replace('data:image/png;base64,', '');
  fs.writeFile(imgPath, img, 'base64', e => {
    if (e) {throw new Error(e)};
//    openalpr.IdentifyLicense(imgPath, {regions: [{x: 0, y: 0, width: 0, height: 0}]}, (e, output) => {
//      console.log(output);
//    });
    res.sendStatus(200);
  });
});

//openalpr.Start();

app.listen(8080, () => {
  console.log('ALPR server listening on port 8080.');
});
