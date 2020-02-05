"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const openalpr = require('node-openalpr');
const fs = require('fs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/', (req, res) => {
  let imgPath = path.resolve(__dirname, Math.random().toString(36).substring(2) + Date.now().toString(36);)
  fs.writeFile(imgPath, req.body.image, e => {
    if (e) {throw new Error(e)};
    openalpr.IdentifyLicense(imgPath, {regions: [{x: 0, y: 0, width: 0, height: 0}]}, (e, output) => {
      console.log(output);
    });
  });
});

openalpr.Start();

app.listen(80, () => {
  console.log('ALPR server listening on port 80.');
});
