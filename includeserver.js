

var http = require('http');
var url = require('url');
var fs = require('fs');
var io = require('./socket.io');
var sys = require(process.binding('natives').util ? 'util' : 'sys');
var mongodb = require('./mongodb');
var seq = require('./step');




function dbconn(f){
	var mongoserv = new mongodb.Server('localhost',mongoport,{});
	var db = new mongodb.Db('pewpew',mongoserv,{});
	seq(
		function(){ db.open(this); },
		function(){
			if(mongoauth){
				db.authenticate(mongo_username,mongo_password,this);
			}else{
				this();
			}
		},
		function(){ f(db); }
	);
}




function send404(req, res){
	res.writeHead(404);
	res.write('404\n');
	res.write(url.parse(req.url).pathname);
	res.end();
}

function fileresp(req, res, path){
	console.log('fileresp: '+path);
	if(path === '/index.html'){
		fs.readFile(__dirname + '/output/index.html', function(err, data){
			if(err) { return send404(req, res); }
			res.writeHead(200, {
				'Content-Type': 'text/html',
				'Cache-Control': 'no-cache'
			});
			res.write(data, 'binary');
			res.end();
		});
	}else{
		var extension = path.split('.').pop();
		if(extension === path) { extension = ''; }
		var ct;
		switch (extension){
		case 'html':
		case 'htm':
		case 'shtml': ct = 'text/html'; break;
		case 'css':   ct = 'text/css'; break;
		case 'js':    ct = 'application/x-javascript'; break;
		case 'gif':   ct = 'image/gif'; break;
		case 'png':   ct = 'image/png'; break;
		case 'jpg':
		case 'jpeg':  ct = 'image/jpeg'; break;
		case 'ico':   ct = 'image/x-icon'; break;
		case 'mp3':   ct = 'audio/mpeg'; break;
		default:      ct = 'application/octet-stream';
		}
		fs.readFile(__dirname + '/output' + path, function(err, data){
			if(err) { return send404(req, res); }
			res.writeHead(200, {
				'Content-Type': ct,
				'Cache-Control': 'max-age=100000000, public'
			});
			res.write(data, 'binary');
			res.end();
		});
	}
}






