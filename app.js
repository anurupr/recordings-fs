'use strict';
const express = require('express');
const fs = require('fs');

const root = 'C:\\';
const gitPull = () => {
  const
      spawn = require( 'child_process' ).exec,
      git = spawn( 'git pull' , {
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


const app = express();

const convertToWindows = (path) => {
  return path.replace("/", "\\");
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

app.listen('8999', '0.0.0.0', () => {
  console.log('started');
});

if(process.argv[2]){
  if(process.argv[2] === "git-test")
    process.exit(0);
}
