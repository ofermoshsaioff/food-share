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

function serve_html_files(path, response) {
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
		console.log(err);
        response.writeHead(500, {'Content-Type' : 'text/plain'});
        response.end('Internal Server Error');
    }
}

exports.start = start;
exports.about = about;
exports.contact = contact;
