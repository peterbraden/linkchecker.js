// Rather than unit tests (which would require a mock server etc.
// here is an example to be used as a smoke-test.

var linkchecker = require('./index') // require('linkchecker.js')
  , events = require('events')
  , emitter = new events.EventEmitter()


emitter.on('resource-response', function(r, source){
  console.log("response from ", r.url, r.statusCode, " linked from ", source)
})

emitter.on('browser-error', function(err, url){
  console.log("browser error on ", url, ":", err)
})

emitter.on('link-encountered', function(link, source){
  console.log('encountered link ', link, ' on page ', source)
})


emitter.on('checking', function(k, d, s, q, r, p){
  console.log("# Checking ", k
                , "depth:", d
                , "source:", s
                , " (in queue:", q
                , ", checked:", r, ")"
                , "[processes:", p, "]")
})

var opts = {
  domains: ['www.example.com', 'example.com']
, depth: 100
, emitter: emitter
}

linkchecker("http://" + opts.domains[1], opts, function(){
  console.log("Linkchecker done!", arguments)
})
