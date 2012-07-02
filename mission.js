


/*


*/



var on_mission_end = function(){};




function MissionCommand() {
	this.kind = '';
}
/* make a new enemy
 */
function cmd_new_enemy(d) {
	var c = new MissionCommand();
	c.kind = 'enemy';
	c.dict = d;
	return c;
}
/* wait for d.t ticks. d.k lets you give it a key so that it doesn't conflict with other things.
   if d.e is true, ends when there aren't any enemies in play.
   if d.b is true, ends when there aren't any enemy bullets in play.
 */
function cmd_wait(d) {
	var c = new MissionCommand();
	for(var k in d){
		c[k] = d[k];
	}
	c.kind = 'wait';
	return c;
}

function cmd_clear_bullets(d){
	//todo
}

function cmd_checkpoint(){
	//todo (revive dead people, refill ammunition)
}

function cmd_end_mission(){
	var c = new MissionCommand();
	c.kind = 'end';
	return c;
}

/* checkpoint; reset/revive all players, and remember that you got this far...?
 * (todo!)
 */
function cmd_checkpoint() {
	var c = new MissionCommand();
	c.kind = 'checkpoint';
	return c;
}

function cmd_par() {
	var c = new MissionCommand();
	c.kind = 'par';
	c.l = copyarr(arguments);
	c.push = function(d){c.l.push(d);};
	return c;
}

function cmd_seq() {
	var c = new MissionCommand();
	c.kind = 'seq';
	if(arguments.length === 0){
		c.l = [];
	}else if(arguments.length === 1 && arguments[0] instanceof Array){
		c.l = copyarr(arguments[0]);
	}else{
		c.l = copyarr(arguments);
	}
	c.push = function(d){c.l.push(d);};
	return c;
}

function Mission() {
	this.cmd = {};
	this.flags = {}; // flagname -> time
	this.nextflag = 0;
}

Mission.prototype.newFlag = function() {
	var f = 'newFlag_'+this.nextflag.toString(16);
	this.nextflag++;
	return f;
};


var apply_cmd;

function apply_cmd_new_enemy(d) {
	var enemy = newEnemy();
	enemy.apply(d.dict);
	return {};
}

function apply_cmd_wait(d) {
	var k;
	if('t' in d){
		if(!('end' in d)){ d.end = tick + d.t; }
		if(tick >= d.end){ return {}; }
	}
	if('e' in d && d.e){
		var hasenemies = false;
		for(k in enemies){ hasenemies = true; break; }
		if(!hasenemies){ return {}; }
	}
	if('b' in d && d.e){
		var hasbullets = false;
		for(k in enemy_bullets){ hasbullets = true; break; }
		if(!hasbullets){ return {}; }
	}
	return d;
}

function apply_cmd_par(d) {
	var offset = 0;
	while(offset < d.l.length){
		var r = apply_cmd.call(this,d.l[offset]);
		if(r instanceof MissionCommand){
			d.l[offset] = r;
			offset++;
		}else{
			d.l.splice(offset,1);
		}
	}
	if(d.l.length === 0){ return {}; }
	else if(d.l.length === 1){ return d.l[0]; }
	return d;
}

function apply_cmd_seq(d) {
	if(d.l.length === 0){ return {}; }
	var r = apply_cmd.call(this,d.l[0]);
	if(r instanceof MissionCommand){
		d.l[0] = r;
	}else{
		d.l.shift();
	}
	if(d.l.length === 0){ return {}; }
	else if(d.l.length === 1){ return d.l[0]; }
	return d;
}

function apply_cmd_end_mission(d){
	//todo: sync up with everyone else
	running = false;
	on_mission_end();
}

apply_cmd = function(d) {
	if(!('kind' in d)){ return {}; }
	assert(d instanceof MissionCommand);
	switch(d.kind){
	case 'enemy': return apply_cmd_new_enemy.call(this,d);
	case 'par':   return apply_cmd_par.call(this,d);
	case 'seq':   return apply_cmd_seq.call(this,d);
	case 'wait':  return apply_cmd_wait.call(this,d);
	case 'end':   return apply_cmd_end_mission.call(this,d);
	}
};

Mission.prototype.tick = function() {
	this.cmd = apply_cmd.call(this,this.cmd);
};








var current_mission = null;

var mission_list = {};

mission_list.prologue = function(){
	var i, j;
	var m = new Mission();
	m.cmd = cmd_seq();
	var l1 = cmd_seq();
	var l2 = cmd_seq();
	for(i = 0; i < 10; i++){
		l1.push(cmd_new_enemy({
			'x':gamewidth*800,
			'y':gameheight*(-100),
			'ai_dict':ai_par(
				ai_seq(
					ai_move(gamewidth*800,gameheight*300),
					ai_move(gamewidth*200,gameheight*300),
					ai_move(gamewidth*200,gameheight*(100)),
					ai_sway(gamewidth*200,gamewidth*800)
				),
				ai_seq(
					ai_wait(50+grand.int(50)),
					ai_shoot_repeat({'t':20,'mode':'aimed','img':'pinkball','varx':10})
				)
			)
		}));
		l1.push(cmd_wait({'t':20}));
		
		l2.push(cmd_new_enemy({
			'x':gamewidth*200,
			'y':gameheight*(-100),
			'ai_dict':ai_par(
				ai_seq(
					ai_move(gamewidth*200,gameheight*400),
					ai_move(gamewidth*800,gameheight*400),
					ai_move(gamewidth*800,gameheight*200),
					ai_sway(gamewidth*200,gamewidth*800)
				),
				ai_seq(
					ai_wait(50+grand.int(50)),
					ai_shoot_repeat({'t':20,'mode':'aimed','img':'pinkball','varx':10})
				)
			)
		}));
		l2.push(cmd_wait({'t':20}));
	}
	m.cmd.push(cmd_par(l1,l2));
	m.cmd.push(cmd_wait({'e':true}));
	m.cmd.push(cmd_end_mission());
	
	current_mission = m;
};

mission_list.m2 = function(){
	var w = 10;
	var m = new Mission();
	m.cmd = cmd_seq();
	for(var i = 0; i < 30; i++){
		var c = cmd_par();
		for(var j = 0; j < w; j++){
			var x = gamewidth*((600*j)/(w-1) + 200);
			c.push(cmd_new_enemy({
				'x':x,
				'y':gameheight*(-100),
				'ai_dict':ai_par(
					ai_seq(
						ai_move({'y':gameheight*300}),
						ai_move({'x':(gamewidth*1000-x)}),
						ai_move({'y':gameheight*(100)}),
						ai_sway(gamewidth*200,gamewidth*800)
					),
					ai_seq(
						ai_wait(50+grand.int(50)),
						ai_shoot_repeat({'t':20,'mode':'aimed','img':'pinkball','varx':10})
					)
				)
			}));
		}
		m.cmd.push(c);
		m.cmd.push(cmd_wait({'t':40}));
	}
	m.cmd.push(cmd_wait({'e':true}));
	m.cmd.push(cmd_wait({'t':40}));
	m.cmd.push(cmd_end_mission());
	current_mission = m;
};



function mission_init() {
}
