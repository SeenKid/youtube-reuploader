const Youtube              = require('youtube-api');
const youtubedl            = require('youtube-dl');
const fs                   = require('fs');
const prettyBytes          = require('pretty-bytes');
const GoogleTokenProvider  = require('refresh-token').GoogleTokenProvider;
const Logger               = require('bug-killer');
const config               = require('./config.json');

var tokenProvider = new GoogleTokenProvider({
  refresh_token: config.refresh_token,
  client_id: config.client_id,
  client_secret: config.client_secret,
});

const upload = (title, description, callback) => {
  tokenProvider.getToken((err, token) => {

    if (err) {
      Logger.error('authenticate error')
      return callback(err, {});
    }

    const videoConfig = {
      resource: {
        snippet: {
          title: title,
          description: description
        },
        status: {
          privacyStatus: "public"
        }
      },
      part: "snippet,status",
      media: {
        body: fs.createReadStream(config.tmp_name)
      }
    };

    let interval;

    Youtube.authenticate({
      type: "oauth",
      token: token
    });

    let req = Youtube.videos.insert(videoConfig, (err, data) => {
      clearInterval(interval)
      callback(err, data);
    });

    interval = setInterval(() => {
      Logger.info(`${prettyBytes(req.req.connection._bytesDispatched)} bytes uploaded.`)
    }, 1000);

  });
}

const download = (uri, callback) => {
  
  let title, desc, video;
  
  video = youtubedl(uri, ['--format=18'], {});

  video.on('info', function(info) {
    desc = `${config.description}\n${info.description}`;
    title = info.title;
    Logger.info(`title : ${title}`);
    Logger.info(`size  : ${info.size}`);
  });

  video.pipe(fs.createWriteStream(config.tmp_name));
  
  video.on('end', () => {
    callback({title: title, description: desc});
  });
}

const reuploadThis = (uri, callback) => {

  Logger.warn(`upluad video ${uri}`);
  
  download(uri, (data) => {

    Logger.warn('video donwloaded');
    Logger.warn('start upload video');

    upload(data.title, data.description, (err, data) => {
      
      if (err) {
        Logger.error('error on upload, stopped');
        return callback();
      } else {
        Logger.warn('video uploaded');
      }
      
      fs.unlink(config.tmp_name)
      Logger.info('temporary video deleted');
      callback();
    })
  });
}

module.exports = reuploadThis;