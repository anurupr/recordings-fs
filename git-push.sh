#!/bin/bash
node app.js git-test

CHECK="$?"
if (( "$CHECK" == "0" )) || (("$CHECK" == "130" )); then 
   /usr/bin/git-push $1
else 
   echo "Error running app"
fi
