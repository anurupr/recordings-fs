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



const getRecordings = (req, res, next) => {
  const recording = req.params.recording;
  if(recording != undefined)
    var files = fs.readdirSync(root + convertToWindows(recording) + "\\recordings\\");


  res.status(200).end(JSON.stringify(files));
};


app.post('/repo', (req, res, rext) => {
  gitPull();
  res.status(200).end('ok');
});

app.get('/streams', getStreams);
app.get('/streams/:recording', getRecordings);


app.listen('8999', '0.0.0.0', () => {
  console.log('started');
});


if(process.argv[2]){
  if(process.argv[2] === "git-test")
    process.exit(0);
}
