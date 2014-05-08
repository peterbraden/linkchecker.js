/*
 * Test website links for valid HTTP Response codes.
 */

var child_process = require('child_process')
  , path = require('path')

var testUrls = module.exports = function(startUrl, opts, cb){

  // Sane Defaults
  opts = opts || {}
  opts.depth = opts.depth || 1
  opts.domains = opts.domains || ["localhost:3000"]

  var queue = {}
    , results = {}

  queue[startUrl] = [0, startUrl] // url, depth, source

  var testUrlIter = function(){
    if (Object.keys(queue).length < 1){
      return cb.apply(this, arguments)
    }

    var k = Object.keys(queue).pop()
      , d = queue[k][0]
      , s = queue[k][1]
      results[k] = 'pending' // Or we can get in cycles...
      delete queue[k]

    console.log("# Checking ", k, "depth:", d, "source:", s, " (in queue:", Object.keys(queue).length, ", checked:", Object.keys(results).length + ")")
    
    // ZombieJS is riddled with memory leaks. We'll just spawn a new one for each page... 
    var z = child_process.fork(path.join(__dirname, 'zombie-process.js'), {})

    z.on('message', function(res){

      if (res.stat == 'event' && opts.emitter){
        opts.emitter.emit.apply(opts.emitter, res.args)
      }
      
      if (res.stat == 'success'){
        // put into queue
        var q = res.results
        q.forEach(function(v){
          var url = v[0] 
            , depth = v[1]
            , source = v[2]
          
          if (results[url] != undefined || queue[url] != undefined){
            // Already searched...
          } else if (url) {
            queue[url] = [depth, source]
          }
        })
        
        z.removeListener('exit', exitListener)
        z.kill("SIGTERM");
        testUrlIter()
      }
    })

    var exitListener = function(){
      console.log("# Unexpected Exit from Zombie")
      testUrlIter()
    }
    z.on('exit', exitListener)

    z.send(JSON.stringify({
      url: k
    , depth : d
    , source : s
    , opts: opts
    }))
  }

  testUrlIter()
}
