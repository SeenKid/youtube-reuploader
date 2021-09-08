const request   = require('request');
const config    = require('./config.json');
const BASE_API  = `https://www.googleapis.com/youtube/v3/search?key=${config.api_key}`;

const uploadFromChanel = (chanel, nbVideos, callback) => {

  let videos = [];
  request(`${BASE_API}&channelId=${chanel}&part=snippet,id&order=date&maxResults=${nbVideos}`, (err, res, body) => {

    body = JSON.parse(body);

    for (item in body.items) {
      videos.push(`https://www.youtube.com/watch?v=${body.items[item].id.videoId}`);
    }

    callback(videos);
  });
}

module.exports = {
  uploadFromChanel
}