'use strict';
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const jsonfile = require('jsonfile');

const root = 'C:\\';

var pathMapping = {};
const gitPull = () => {
  const
      exec = require( 'child_process' ).exec,
      git = exec( 'git pull' , {
          cwd:  "C:\\recordings-fs\\"
      });

      //console.log('test');
      //console.log('git', git);

  git.stdout.on( 'data', data => {
      console.log( `stdout: ${data}` );
  });

  git.stderr.on( 'data', data => {
      console.log( `stderr: ${data}` );
  });

  git.on( 'close', code => {
      console.log( `child process exiteds with code ${code}` );
  });
}

const npmInstall = () => {
  const
      exec = require( 'child_process' ).exec,
      npm = spawn( 'npm install' , {
          cwd:  "C:\\recordings-fs\\"
      });

      //console.log('test');
      //console.log('git', git);

  npm.stdout.on( 'data', data => {
      console.log( `stdout: ${data}` );
  });

  npm.stderr.on( 'data', data => {
      console.log( `stderr: ${data}` );
  });

  npm.on( 'close', code => {
      console.log( `child process exiteds with code ${code}` );
  });
}

const app = express();

app.use(cors());

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

const convertToWindows = (path) => {
  return path.replaceAll("/", "\\");
};

const readHebrewSchedule = () => {
  var file = 'hebrew_schedule.json';
  return jsonfile.readFileSync(file);
}

const hebrewSchedule = readHebrewSchedule();

const getStreams = (req, res, next) => {
  const files = fs.readdirSync(root);

  var streamfiles = files.filter((file) => {
    return file.indexOf('tv') != -1;
  });

  res.status(200).end(JSON.stringify(streamfiles));
};

const getChannels = (req, res, next) => {
  const channeltype = req.params.channeltype;
  if(channeltype != undefined){
    var files = fs.readdirSync(root + channeltype + "\\recordings\\");
    res.status(200).end(JSON.stringify(files));
  }
  else{
    res.status(500).end(JSON.stringify({message: "Couldnt find channel"}));
  }
};

const getRecordingList = (req, res, next) => {
   const channeltype = req.params.channeltype;
   const channel = req.params.channel;

   if(channeltype != undefined && channel != undefined){
     var files = fs.readdirSync(root + channeltype + "\\recordings\\" + channel);
     var output = [];
     files.forEach((file) => {
        var subfiles = fs.readdirSync(root + channeltype + "\\recordings\\" + channel + "\\" + file);
        if(subfiles.length > 0){
          output.push(file);
        }
     });
     res.status(200).end(JSON.stringify(output));
   }
   else{
     res.status(500).end(JSON.stringify({message: "Couldnt find recordings"}));
   }
};

var filter = function(fields, index){
  var f = {};

  Object.keys(fields).forEach(function(key){
    if(key.indexOf(index) !== -1){
      f[key] = fields[key];
    }
  });

  return f;
};

const getTimedFiles = (req, res, next) => {
    const channeltype = req.params.channeltype;
    const channel = req.params.channel;
    const recording = req.params.recording;

    if(channeltype != undefined && channel != undefined && recording != undefined){
      var files = fs.readdirSync(root + channeltype + "\\recordings\\" + channel + "\\" + recording);
      res.status(200).end(JSON.stringify(files));
    }
    else{
      res.status(500).end(JSON.stringify({message: "Couldnt find timed files"}));
    }
}

app.post('/repo', (req, res, rext) => {
  gitPull();
  res.status(200).end('ok');
});

app.get('/streams', getStreams);
app.get('/streams/:channeltype', getChannels);
app.get('/streams/:channeltype/:channel', getRecordingList);
app.get('/streams/:channeltype/:channel/:recording', getTimedFiles);

//app.get('*.mp4', (req, res, next) => {
app.get('/streams/:channeltype/:channel/:recording/:file', (req, res, next) => {
  //const channeltype = req.query.channeltype;
  //const channel = req.query.channel;
  //const recording = req.query.recording;
  const channeltype = req.params.channeltype;
  const channel = req.params.channel;
  const recording = req.params.recording;
  const file = req.params.file;
  console.log('url', req.originalUrl);
  //var split = req.originalUrl.split('?');
  //var replace = '/streams/'+channeltype+'/'+channel+'/'+recording+'/';
  //var file = split[0].replace(replace,'');
  var path = root + channeltype + '/recordings' + '/' + channel + '/' + recording + '/' + file;

  var winpath = convertToWindows(path);

  var ifPathExists = fs.existsSync(winpath);
  // console.log('path', pathMapping[winpath]);
  if(ifPathExists) {
    res.setHeader("content-type", "video/mp4");
    ///fs.createReadStream(pathMapping[winpath]).pipe(res);
    fs.stat(winpath, function(err, stats) {
      if (err) {
        if (err.code === 'ENOENT') {
          // 404 Error if file not found
          return res.sendStatus(404);
        }
      res.end(err);
      }
      var range = req.headers.range;
      if (!range) {
       // 416 Wrong range
       return res.sendStatus(416);
      }
      var positions = range.replace(/bytes=/, "").split("-");
      var start = parseInt(positions[0], 10);
      var total = stats.size;
      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      var chunksize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4"
      });

      var stream = fs.createReadStream(winpath, { start: start, end: end })
        .on("open", function() {
          stream.pipe(res);
        }).on("error", function(err) {
          res.end(err);
        });
    });
  } else {
    res.status(200).end("Cant find file");
  }
});

app.listen('9000', '0.0.0.0', () => {
  console.log('started');
});

if(process.argv[2]){
  if(process.argv[2] === "git-test")
    process.exit(0);
}
