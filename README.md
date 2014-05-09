# linkchecker.js

```javascript

var linkchecker = require('linkchecker.js')

var opts = {
  domains: ['mysite.com', 'www.mysite.com'] // linkchecker will verify all links and resources, but only follow/crawl links on these domains
, depth: 100
, emitter: errorEmitter // See below
}


linkchecker("http://mysite.com", opts, function(){// Woohoo.})



var errorEmitter = new require('events').EventEmitter

errorEmitter.on('resource-response', function(r, source){
  console.log("response from ", r.url, r.statusCode)
})


// errorEmitter also emits 'browser-error'




//

```
