#!/bin/bash
node app.js git-test

CHECK="$?"
if (( "$CHECK" == "0" )) || (("$CHECK" == "130" )); then 
   /usr/bin/git-push
else 
   echo "Error running app"
fi
