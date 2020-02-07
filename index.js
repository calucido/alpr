"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const https = require('https');
const child_process = require('child_process');
const Fuse = require('fuse.js');
const { send } = require('./lib/common');

const app = express();

app.use(bodyParser.urlencoded({extended: true, limit: '8mb'}));

app.get('/', (req, res) => {
  res.setHeader('Feature-Policy', `camera 'self'`);
  return res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
});

app.use(express.static(path.resolve(__dirname, 'frontend')));

let activePlates = [];
let knownPlates = [{
  'prettyName': 'Range Rover',
  'plate': 'JSR7650'
}, {
  'prettyName': 'Mini',
  'plate': 'URZ6868'
}];
const plateSearch = new Fuse(knownPlates, {keys: ['plate'], id: 'plate'});

app.post('/', (req, res) => {
  let imgPath = path.resolve(__dirname, 'frames',  Math.random().toString(36).substring(2) + Date.now().toString(36) + '.png');
  let img = req.body.img.replace('data:image/png;base64,', '');
  img = img.replace(/ /g, '+');
  img = img.replace(/\n/g, '');
  fs.writeFile(imgPath, img, {encoding: 'base64'}, e => {
    if (e) {throw new Error(e)};
    const idProcess = child_process.spawn('alpr', ['-c us', '-j', '--config ' + path.resolve(__dirname, 'openalpr.conf'), imgPath]);
    idProcess.stdout.on('data', data => {
      data = JSON.parse(data.toString());
      if (data.results.length !== 0) {
	let plateKnown;
        let resultPlate = data.results[0].plate
	let matchedPlate = plateSearch.search(resultPlate)[0];
	if (matchedPlate) {
          matchedPlate = matchedPlate.prettyName;
          plateKnown = true;
        } else {
          matchedPlate = resultPlate;
          plateKnown = false;
        }
        if (activePlates.indexOf(matchedPlate) === -1) {
          if (plateKnown) {
            activePlates.push(matchedPlate);
          } else {
            for (let candidate of data.results[0].candidates) {
              activePlates.push(candidate.plate);
            }
          }
          console.log(`${matchedPlate} seen.`);
          send(process.env.CHAT_ID, `${matchedPlate} seen.`, (e) => {
            if (e) { throw new Error(e); }
            res.sendStatus(200);
          });
        } else {
          res.sendStatus(200);
        }
      } else {
        activePlates = [];
        res.sendStatus(200);
      }
    });
    idProcess.on('close', code => {
      fs.unlink(imgPath, e => {
        if (e) throw new Error(e);
      });
    });
  });
});

if (process.env.DEV === 'true') {

  app.listen(8080, () => {
    console.log('ALPR test server listening on port 8080.');
  });

} else {
  
  const sslOptions = {
    key: fs.readFileSync(__dirname + '/ssl/selfsigned.key'),
    cert: fs.readFileSync(__dirname + '/ssl/selfsigned.crt')
  };
  
  const httpsApp = https.createServer(sslOptions, app);
  
  httpsApp.listen(8443, () => {
    console.log('ALPR server listening on port 8443.');
  });
}
