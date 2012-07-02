
var clientusername = {};
var usernameclient = {};


var server = http.createServer(function(req, res){
	var path = url.parse(req.url).pathname;
	if(path === '/') { path = '/index.html'; }
	
	if(path === 'dosomethingwithregularexpressions'){
	}else{
		fileresp(req, res, path);
	}
});


server.listen(port);

// socket.io
var gserver = io.listen(server);


gserver.on('connection', function(client){
	//client.send({ buffer: buffer });
	//client.broadcast({ announcement: client.sessionId + ' connected' });
	
	client.on('message', function(m){
		switch(m.a){
			// game socket stuff
		case 'j': //join
			return clientjoin(client,m);
		case 'r': //ready
			return clientready(client,m);
		case 'u': //update
			return clientupdate(client,m);
			// info socket stuff
		case 'login':
			return userlogin(client,m);
		case 'register':
			return usercreate(client,m);
		}
	});
	
	//client.on('disconnect', function(){
	//  client.broadcast({ announcement: client.sessionId + ' disconnected' });
	//});
});


fs.writeFile("_server.pid",process.pid.toString());
//console.log(process.pid);
user_index(function(){
	new_user('blah','asdf',function(){});
});

