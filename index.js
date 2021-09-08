const args      = require('args');
const reupload  = require('./reupload.js');
const requests  = require('./requests');

args.option('chanel', 'upload last chanel videos [chanel id]')
    .option('number', 'number of video to upload [0-50] [default 1]');

const flags         = args.parse(process.argv);
const numberVideos  = (flags.number) ? flags.number : 1;
let videos = [];

const upload = (videos) => {

  const uploadSingle = (id) => {

    if (!videos[id]) return ;

    reupload(videos[id], () => {
      uploadSingle(id + 1);
    });
  }

  uploadSingle(0);
}

if (flags.chanel) {
  requests.uploadFromChanel(flags.chanel, numberVideos, upload);
}