'use strict';
const express = require('express');

const gitPull = () => {
  const
      spawn = require( 'child_process' ).spawn,
      git = spawn( 'git', [ 'pull'] , {
          cwd:  "C:\\"
      });

  git.stdout.on( 'data', data => {
      console.log( `stdout: ${data}` );
  });

  git.stderr.on( 'data', data => {
      console.log( `stderr: ${data}` );
  });

  git.on( 'close', code => {
      console.log( `child process exited with code ${code}` );
  });
}


const app = express();


app.post('/repo', (req, res, rext) => {
  gitPull();
  res.status(200).end('OK');
})


app.listen('8999', '0.0.0.0', () => {
  console.log('started');
});
