var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/home"] = requestHandlers.start;
handle["/about"] = requestHandlers.about;
handle["/contact"] = requestHandlers.contact
handle["/bangyouredead"] = requestHandlers.bang
server.start(router.route, handle);