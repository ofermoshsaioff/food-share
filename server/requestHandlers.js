var fs = require('fs'),
	formidable = require('formidable'),
	sys = require('sys'),
	mu = require('mu2'),
	util = require('util')

function start(response, request) {
	serve_html_files('./index.html', response);
}

function about(response, request) {
	serve_html_files('./about.html', response);
}

function contact(response, request) {
	serve_html_files('./contact.html', response);
}

function bang(response, request) {
	var form = new formidable.IncomingForm();
	form.parse(request, function(error, fields, files) {
		console.log(fields.name);
		console.log(fields.rest);
		var stream = mu.compileAndRender('bangyouredead.html', {name: fields.name, rest: fields.rest});
		util.pump(stream, response);
		});
	}

function showWhosEatingWhat(fields, response) {
	serve_html_files('./bangyouredead.html', response);
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
exports.bang = bang;
