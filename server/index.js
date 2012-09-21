var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/home"] = requestHandlers.start;
handle["/about"] = requestHandlers.about;
handle["/contact"] = requestHandlers.contact
handle["/css/bootstrap.css"] = requestHandlers.bootstrapcss;
handle["/js/bootstrap.min.js"] = requestHandlers.bootstrapminjs;
handle["/js/bootstrap.js"] = requestHandlers.bootstrapjs;

server.start(router.route, handle);