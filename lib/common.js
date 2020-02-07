"use strict";
const request = require('request')
    , packageJSON = require('../package.json');

module.exports.send = (to, message, callback) => {
  const options = {
    url: `https://api.telegram.org/bot${process.env.TELEGRAM_API_KEY}/sendMessage?chat_id=${to}&text=${encodeURIComponent(message)}&parse_mode=markdown`,
    headers: {
      'User-Agent': `LucidoDrivewayBot/${packageJSON.version}`
    }
  };
  request.get(options, (e, response, body) => {
    body = JSON.parse(body);
    if (body.ok === false) {
      e = body.description;
    }
    return callback(e);
  });
};
