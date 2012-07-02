


/*

  ai for enemies

  ai for designers: an ai is defined as a dict, with 'kind' from the list:
  par
  seq
  loop
  move
  sway
  shoot

  ai for programmers: given a dict, call the appropriate apply_ai_* function.
  each is supposed to return true if it can be run again next tick, false if it should not, or return an object to replace it for future ticks.

*/



function AI(kind, d){
	if(d !== undefined){
		for(var k in d){
			this[k] = d[k];
		}
	}
	this.kind = kind;
}

AI.prototype.clone = function() {
	var o = new AI(this.kind,this);
	for(var k in o){
		if(o[k] instanceof AI){
			o[k] = o[k].clone();
		}else if(o[k] instanceof Array){
			o[k] = copyarr(o[k]);
			for(var i = 0; i < o[k].length; i++){
				if(o[k][i] instanceof AI){
					o[k][i] = o[k][i].clone();
				}
			}
		}
	}
	return o;
};

function ai_shoot(d) {
	return new AI('shoot',d);
}

function ai_par(){
	return new AI('par',{'l':copyarr(arguments)});
}

function ai_seq(){
	return new AI('seq',{'l':copyarr(arguments)});
}

function ai_loop(){
	return new AI('loop',{'l':copyarr(arguments)});
}

function ai_wait(t){
	return new AI('wait',{'t':t});
}

function ai_move(a,b) {
	if(a !== undefined && b !== undefined){
		return new AI('move',{'x':a,'y':b});
	}else{
		return new AI('move',a);
	}
}

function ai_shoot_repeat(d){
	var t = 10;
	if('t' in d){ t = d.t; }
	return ai_loop(
		ai_shoot(d),
		ai_wait(t)
	);
}

function ai_sway(xmin,xmax) {
	return ai_loop(new AI('move',{'x':xmin}),
				   new AI('move',{'x':xmax}));
}

function ai_swayandshoot(xmin,xmax) {
	return ai_par(
		ai_sway(xmin,xmax),
		ai_shoot_repeat({})
	);
}

function ai_space_invader() {
	return ai_swayandshoot(gamewidth*200,gamewidth*800);
}

var apply_ai;

function apply_ai_shoot(d) {
	this.lastshot = this.tickspershot;
	this.spawnEnemyBullet(d);
	return {};
}

function apply_ai_par(d){
	var offset = 0;
	while(offset < d.l.length){
		var r = apply_ai.call(this,d.l[offset]);
		if(r instanceof AI){
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

function apply_ai_seq(d){
	if(d.l.length === 0){ return {}; }
	var r = apply_ai.call(this,d.l[0]);
	if(r instanceof AI){
		d.l[0] = r;
	}else{
		d.l.shift();
	}
	if(d.l.length === 0){ return {}; }
	else if(d.l.length === 1){ return d.l[0]; }
	return d;
}

function apply_ai_loop(d){
	if(!('pl' in d)){
		d.pl = d.clone();
	}
	if(d.l.length === 0){ return d.pl; }
	var r = apply_ai.call(this,d.l[0]);
	if(r instanceof AI){
		d.l[0] = r;
	}else{
		d.l.shift();
	}
	if(d.l.length === 0){ return d.pl; }
	return d;
}

function apply_ai_wait(d){
	if(!('end' in d)){ d.end = tick + d.t; }
	if(tick >= d.end){ return {}; }
	return d;
}

function apply_ai_move(d){
	var x = this.x;
	var y = this.y;
	if('x' in d){ x = d.x; }
	if('y' in d){ y = d.y; }
	var dx = x - this.x;
	var dy = y - this.y;
	if(dx === 0 && dy === 0){
		this.dx = 0;
		this.dy = 0;
		return {};
	}
	var l = Math.sqrt(dx*dx+dy*dy);
	var s = d.speed ? d.speed : this.speed;
	if(l <= s){
		this.dx = dx;
		this.dy = dy;
		if(d.continuous){ return {}; }
	}else {
		var sl = s/(1.0*l);
		this.dy = Math.floor(dy*sl);
		this.dx = Math.floor(dx*sl);
	}
	return d;
}

apply_ai = function(d){
	if(!('kind' in d)){ return {}; }
	assert(d instanceof AI);
	var r;
	
	switch(d.kind){
	case 'par':   r = apply_ai_par.call(  this,d); break;
	case 'seq':   r = apply_ai_seq.call(  this,d); break;
	case 'loop':  r = apply_ai_loop.call( this,d); break;
	case 'wait':  r = apply_ai_wait.call( this,d); break;
	case 'move':  r = apply_ai_move.call( this,d); break;
	case 'shoot': r = apply_ai_shoot.call(this,d); break;
	}
	if(r instanceof AI){ return r; }
	else if('oncompletion' in d){ return d.oncompletion; }
	return {};
};











function AI_init() {
}
