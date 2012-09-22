var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");

function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
	console.log("Request for " + pathname + " received.");

	// first serve css and js files
	var ext = path.extname(pathname);
	var filetype = '';
	if (ext == '.css' || ext == '.js' || ext == '.ico') {
		if (ext == '.css') {
			filetype = 'text/css';
		} else if (ext == '.js') {
			filetype = 'text/js';
		} else if (ext == '.ico') {
			filetype = 'image/x-icon';
		}
		try {
		fs.readFile('./'+pathname, 'utf-8', function(error, content){
            if(error){
                console.log(error);
                response.writeHead(500, {'Content-Type' : 'text/plain'});
                response.end('Internal Server Error');
            }else{
                response.writeHead(200, {'Content-Type' : filetype});
                response.end(content);
            }
		});
		} catch(err){
			console.log(err);
			response.writeHead(500, {'Content-Type' : 'text/plain'});
			response.end('Internal Server Error');
		}
	// now serve all the rest of the requests
	} else {
		route(handle, pathname, response);
		}
	}

  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}

exports.start = start;