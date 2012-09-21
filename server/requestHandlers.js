var fs = require('fs');

function start(response) {
	serve_html_files('./index.html', response);
}

function about(response) {
	serve_html_files('./about.html', response);
}

function contact(response) {
	serve_html_files('./contact.html', response);
}

function bootstrapcss(response) {
  serve_css_files('./css/bootstrap.css', response);
}

function bootstrapminjs(response) {
	serve_js_files('./js/bootstrap.min.js', response);
}

function bootstrapjs(response) {
	serve_js_files('./js/bootstrap.js', response);
}

function serve_html_files(path, response) {
  console.log("Request handler for " + path +" was called.");
  try {
		fs.readFile(path, 'utf-8', function(error, content){
            if(error){
                console.log(error);
                response.writeHead(500, {'Content-Type' : 'text/plain'});
                response.end('Internal Server Error');
            }else{
                response.writeHead(200, {'Content-Type' : 'text/html'});
                response.end(content);
            }
		});
    } catch(err){
        response.writeHead(500, {'Content-Type' : 'text/plain'});
        response.end('Internal Server Error');
    }
}

function serve_js_files(path, response) {
  console.log("Request handler for " + path +" was called.");
  try {
		fs.readFile(path, 'utf-8', function(error, content){
            if(error){
                console.log(error);
                response.writeHead(500, {'Content-Type' : 'text/plain'});
                response.end('Internal Server Error');
            }else{
                response.writeHead(200, {'Content-Type' : 'text/javascript'});
                response.end(content);
            }
		});
    } catch(err){
        response.writeHead(500, {'Content-Type' : 'text/plain'});
        response.end('Internal Server Error');
    }
}

function serve_css_files(path, response) {
  console.log("Request handler for " + path +" was called.");
  try {
		fs.readFile(path, 'utf-8', function(error, content){
            if(error){
                console.log(error);
                response.writeHead(500, {'Content-Type' : 'text/plain'});
                response.end('Internal Server Error');
            }else{
                response.writeHead(200, {'Content-Type' : 'text/css'});
                response.end(content);
            }
		});
    } catch(err){
        response.writeHead(500, {'Content-Type' : 'text/plain'});
        response.end('Internal Server Error');
    }
}

exports.start = start;
exports.about = about;
exports.contact = contact;
exports.bootstrapcss = bootstrapcss;
exports.bootstrapminjs = bootstrapminjs;
exports.bootstrapjs = bootstrapjs;
