'use strict';
const express = require('express');
const fs = require('fs');

const cors = require('cors');

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
     res.status(200).end(JSON.stringify(files));
   }
   else{
     res.status(500).end(JSON.stringify({message: "Couldnt find recordings"}));
   }
};

const getTimedFiles = (req, res, next) => {
    const channeltype = req.params.channeltype;
    const channel = req.params.channel;
    const recording = req.params.recording;

    if(channeltype != undefined && channel != undefined && recording != undefined){
      var files = fs.readdirSync(root + channeltype + "\\recordings\\" + channel + "\\" + recording);
      files.forEach((file) => {
        pathMapping[root + channeltype + "\\" + channel + "\\" + recording + "\\" + file] = root + channeltype + "\\recordings\\" + channel + "\\" + recording + "\\" + file;
      });
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

app.get('*.mp4', (req, res, next) => {
  var path = req.originalUrl.replace("/streams/","");
  var winpath = root+convertToWindows(path);

  var ifPathExists = fs.existsSync(pathMapping[winpath]);
  if(ifPathExists) {
    res.setHeader("content-type", "video/mp4");
    fs.createReadStream(pathMapping[winpath]).pipe(res);
  } else {
    res.status(200).end("Cant find file");
  }
});

app.listen('8999', '0.0.0.0', () => {
  console.log('started');
});

if(process.argv[2]){
  if(process.argv[2] === "git-test")
    process.exit(0);
}
