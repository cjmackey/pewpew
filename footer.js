

var full_times = [];
var draw_times = [];
var calc_times = [];
var draw_skips = [];
var ping_times = [];

var num_enemies = 0;
var num_enemy_bullets = 0;
var num_allies = -1;
var num_ally_bullets = 0;

var footcontent;
var footlogtxt = '';

function footlog(s){
		footlogtxt += s;
}

function runavg(l){
		if(l.length>100){l.shift();}
		else if(l.length < 1){return 0.0;}
		var s = 0.0;
		for(var i=0; i<l.length; i++){
				s += l[i];
		}
		return s/l.length;
}


function drawfooter(){
		var s = '';
		s += ' max time: '+(1.0/fps).toFixed(5);
		s += ' full time: '+runavg(full_times).toFixed(5);
		s += ' calc time: '+runavg(calc_times).toFixed(5);
		s += ' draw time: '+runavg(draw_times).toFixed(5);
		s += ' draw ratio: '+runavg(draw_skips).toFixed(2);
		s += ' ping time: '+runavg(ping_times).toFixed(5);
		s += ' tick: '+tick;
		s += '<br />';
		s += ' enemies: '+num_enemies;
		s += ' enemy bullets: '+num_enemy_bullets;
		s += ' player damage: '+player.damage;
		s += ' allies: '+num_allies;
		s += ' ally bullets: '+num_ally_bullets;
		s += '<br>';
		s += ' playernum: '+playernum;
		s += ' numplayers: '+numplayers;
		s += ' playerkey: '+playerkey;
		s += ' gamekey: '+gamekey;
		s += '<br>';
		s += footlogtxt;
		footcontent.empty();
		footcontent.append(s);
}




function footer_init(){
		$('body').append('<div id="foot"><div id="stop">STOP</div><span id="footcontent"></span></div>');
		footcontent = $('#footcontent');
		$('#stop').click(function(){
				if(gsock !== undefined){
						gsock.disconnect();
				}
				running = false;
		});
}


