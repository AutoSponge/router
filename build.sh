#!/usr/bin/env bash

jshint --reporter node_modules/jshint-stylish/stylish.js src/*.js
cr -M 130 -C 3 -D 9 -f minimal src/*.js
browserify test/*.js > test/build/bundle.js
browserify -t coverify test/*.js | testling | coverify
browserify -s Router src/index.js > dist/router.js
uglifyjs dist/router.js -o dist/router.min.js -m -c unused=false -r Router,RouterResponse,RouterEvent
