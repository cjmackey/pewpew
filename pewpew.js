
var running;
var shoulddraw=true;

var fps = 40.0;

var tick;
var starttime;


function gameloop(){
	var time0 = time_s();
	if(!running){ return; }
	if(tick===0){	starttime = time0; }
	
	var time4 = time_s();
	current_mission.tick();
	tick+=1;
	
	var time5 = time_s();
	physicsstep();
	var time6 = time_s();
	if(shoulddraw){
		drawscene();
	}
	var time7 = time_s();
	send_update();
	var time8 = time_s();
	
	calc_times.push(time6-time4);
	if(shoulddraw){
		draw_times.push(time7-time6);
		draw_skips.push(1);
	}else{
		draw_skips.push(0);
	}
	drawfooter();
	var time9 = time_s();
	full_times.push(time9-time0);
	
	var nexttime = starttime+tick/fps;
	var dt = between(1000*(nexttime-time9),1,10000);
	shoulddraw = dt > 1;
	setTimeout(gameloop,dt);
}



function prep_game(mission,seed){
	grand = new Rand(seed);
	startphysics();
	running = true;
	mission_list[mission]();
}


function pewpew_init(){
	playernum = 0;
	numplayers = 1;
	playerkey = (new Rand()).int().toString();
	
	
	var ha = window.location.hash;
	if(ha){
		ha = ha.substr(1); //remove '#'
		var o = {};
		try{
			o = JSON.parse(ha);
		}catch(e){
			alert('failed to parse JSON: ' + ha);
		}
		if('twotickets' in o){ return display_armory(); }
		
		//alert(ha+' '+ o);
		if('numplayers' in o){ numplayers = o.numplayers; }
		if('playernum' in o){ playernum = o.playernum; }
		if('playerkey' in o){ playerkey = o.playerkey; }
		if('gamekey' in o){ gamekey = o.gamekey; }
		if('vertical' in o){
			display_vertical = o.vertical;
			recanvas();
		}
	}else{
		//do login/register stuff
		loginorregister_init();
		return;
	}
	
	if(gamekey !== undefined){
		gconnect();
	}else{
		//single player offline
		prep_game('prologue',23);
		gameloop();
	}
}



















