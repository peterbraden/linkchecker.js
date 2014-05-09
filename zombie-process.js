/* process to start a zombie browser and check links
 *
 *  Message in: URL
 *  Message out: Links, Resources
 *
 *
 */


var Zombie = require('zombie')
  , url = require('url')

  , CHROME_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/53i" + 
                "7.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36")


process.on('message', function(m){
  var args = JSON.parse(m)
  
  createTest(args.url, args.depth, args.source, args.opts, function(err, results){    
    process.send({stat: "success", results: results})
  })
})

// Emit events over process message
var emit = function(ev){
  process.send({stat: 'event', name: ev, args: Array.prototype.slice.call(arguments)})
}

// Entrypoint
var createTest = module.exports = function(url, depth, source, opts, cb){

  var queue = []
    , results = {}

  var browser = new Zombie({silent:true, userAgent : CHROME_UA})

  browser.on('response', function(req, res){
    if (matchDomainWhitelist(res.url, opts.domains)){
      results[res.url] = [res.statusCode, source]
      emit('resource-response', {url: res.url, statusCode: res.statusCode} , source)    

    }
  })

  browser.on('error', function(err){
    emit('browser-error', err, url)
  })

  browser.on('loaded', function(req, res){
    emit('resource-response', {url: url, statusCode: browser.statusCode}, source) 
  })

  browser.visit(url, function(e){
    if (matchDomainWhitelist(url, opts.domains)){
      if (browser.error){
        emit('browser-error', browser.error, url)
      } 

      browser.wait(function(){
        parseLinks(url, queue, results, browser, depth, opts.depth)
        return cb(null, queue)
      })

    } else {
        browser.close()
        return cb(null, queue)
    }

  })
}


var parseLinks = function(url, queue, results, browser, depth, maxdepth){
  // Parse out links
  var links = browser.document.querySelectorAll('a')

  // links is NodeList, not array, can't forEach()
  for (var i = 0; i< links.length; i++){
    var href = links[i].href
    if (goodUrl(href) && !results[href] && depth+1 < maxdepth) {
      results[href] = 'pending'
      queue.push([href, depth+1, url])
    }
  }
}

var goodUrl = function(url){
  if (url.indexOf("javascript:") == 0) return false
  if (url.indexOf("mailto:") == 0) return false
  if (url.indexOf("itmss:") == 0) return false // iTunes link
  return true

}

var matchDomainWhitelist = function(domain, whitelist){
  var host = url.parse(domain).host
  return whitelist.indexOf(host) > -1
}




