
var games = {};
var sessionIdGames = {};

function clientjoin(client,m){
	var g;
	if(m.gamekey in games){
		g = games[m.gamekey];
	}else{
		g = {
			'gamekey':m.gamekey,
			'numplayers':m.numplayers,
			'players':{},
			'cplnum':0
		};
		games[m.gamekey] = g;
	}
	if(g.cplnum >= g.numplayers){
		client.send({'success':false,'error':'too many players'});
		return;
	}
	var pn = g.cplnum;
	g.cplnum += 1;
	g.players[client.sessionId] = 
		{'sock':client,'playernum':pn,'ready':false};
	sessionIdGames[client.sessionId] = g.gamekey;
	if(g.cplnum === g.numplayers){
		for(var k in g.players){
			var p = g.players[k];
			p.sock.send({
				'success':true,
				'numplayers':g.numplayers,
				'playernum':p.playernum,
				'playerkey':p.playerkey
			});
		}
	}
}


function clientready(client,m){
	var gk = sessionIdGames[client.sessionId];
	var g = games[gk];
	var k;
	g.players[client.sessionId].ready = true;
	
	var allready = true;
	for(k in g.players){
		allready = allready && g.players[k].ready;
	}
	if(allready){
		for(k in g.players){
			g.players[k].sock.send({
			});
		}
	}
}

function clientupdate(client,m){
	var gk = sessionIdGames[client.sessionId];
	var g = games[gk];
	/*
	if(m.ti % 100 === 0){
		console.log(m);
	}
	*/
	for(var k in g.players){
		if(k !== client.sessionId){
			g.players[k].sock.send({
				'u':m.u,
				't':m.ti
			});
		}
	}
	client.send({
		't':m.t
	});
}


