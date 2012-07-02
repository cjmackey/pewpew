


var gsock;
var gsready;
var gpready;

var recv_counts = {};

function recv_update(m){
	//todo: apply updates to stuff
	if(!('u' in m)){
		ping_times.push(0.001*(time_ms()-m.t));
		return;
	}
	var len = m.u.length;
	var pix = null;
	for(var i = 0; i < len; i++){
		var ev = m.u[i];
		var action = ev[0];
		var ix = ev[1];
		var params = ev[2];
		
		if(!(ev[0] in recv_counts)){
			recv_counts[ev[0]] = 0;
		}
		recv_counts[ev[0]]++;
		switch(ev[0]){
		case 'npb':
			//new ally bullet
			newAllyBullet(ev[1],ev[2]);
			break;
		case 'np':
			//new ally
			newAlly(ev[1],ev[2]);
			break;
		case 'p':
			//update ally
			var ally = allies[ix];
			pix = ix;
			ally.apply(params);
			if(!('dx' in params)){ ally.dx = 0; }
			if(!('dy' in params)){ ally.dy = 0; }
			break;
		case 'de':
			//damage enemy
			if(ev[1] in enemies){
				enemies[ev[1]].takedamage(ev[2].damage);
			}
			break;
		case 'cpb':
			if(ev[1] in ally_bullets){
				ally_bullets[ev[1]].tocull = true;
			}
		}
	}
	eventlist.push(['r',pix,m.t]);
	/*
	if(tick%100 === 0){
		console.log(m);
		console.log(recv_counts);
	}
	*/
}

function send_update(){
	//send what updates we have
	//todo: also send input status
	if(gsock === undefined){
		return;
	}
	var l = [];
	for(var i = 0; i < eventlist.length; i++){
		var e = eventlist[i];
		if(e !== undefined && e !== null){
			l.push(e);
		}
	}
	gsock.send({
		'a':'u',
		'u':l,
		//'input':{},
		'ti':tick,
		't':time_ms()
	});
	eventlist = [];
}

function gconnect() {
	gsready = false;
	gpready = false;
	gsock = new io.Socket(null, {'port': port, 'rememberTransport': false});
	gsock.connect();
	gsock.on('message', function(obj){
		//when we receive a message
		if(gsready){
			if(gpready){
				recv_update(obj);
			}else{
				//other players are ready
				gpready = true;
				gameloop();
			}
		}else{
			if(obj.success===true){
				//ready to prep the game
				gsready = true;
				numplayers = obj.numplayers;
				playernum = obj.playernum;
				playerkey = obj.playerkey;
				//prepare the game to start
				prep_game();
				//say that we're prepared
				gsock.send({
					'a':'r',
					'gamekey':gamekey,
					'playerkey':playerkey
				});
				drawfooter();
			}else{
				alert('failed to join game: ' + obj.error);
			}
		}
	});
	gsock.send({
		'a':'j',
		'gamekey':gamekey,
		'numplayers':numplayers,
		'playerkey':playerkey,
		'username':username,
		'hashpass':hashpass
	});
}




function net_init() {
	
}







