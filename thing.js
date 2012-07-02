





function Thing(ix,kind,seed) {
	this.ix = ix;
	this.kind = kind; // 'p' (player), 'a' (ally), 'e' (enemy), 'pb' (playerbullet)...
	this.seed = seed;
}
Thing.prototype.nextindex = 0;
Thing.prototype.dr = 200;
Thing.prototype.cr = 200;
Thing.prototype.cull_on_exit = true;
Thing.prototype.stop_on_exit = false;
Thing.prototype.x  = 0;
Thing.prototype.y  = 0;
Thing.prototype.dx = 0;
Thing.prototype.dy = 0;
Thing.prototype.speed = 100;
Thing.prototype.age = 0;
Thing.prototype.maxage = null;
Thing.prototype.tickspershot = 2;
Thing.prototype.steps = 1;
Thing.prototype.tocull = false;
Thing.prototype.damage = 0;
Thing.prototype.diedamage = 1000;
Thing.prototype.power = 500;
Thing.prototype.hit = false;
Thing.prototype.drawrotated = false;
Thing.prototype.angle = null;
Thing.prototype.omega = 0.0; // angular velocity
Thing.prototype.img = null;
Thing.prototype.ai_dict = {};

Thing.prototype.rand = function(){
	if(this.inner_rand === undefined){
		this.inner_rand = new Rand(this.seed);
	}
	return this.inner_rand;
};
Thing.prototype.int = function(a,b){
	return this.rand().int(a,b);
};
Thing.prototype.real = function(a,b){
	return this.rand().real(a,b);
};

Thing.prototype.onCull = function() {};

Thing.prototype.spawnIndex = function() {
	var o = this.nextindex;
	this.nextindex += 1;
	return this.ix+'_'+o.toString(16);
};
Thing.prototype.dist = function(t) {
	var dx = this.x-t.x;
	var dy = this.y-t.y;
	return Math.sqrt(dx,dy);
};
Thing.prototype.takedamage = function(power) {
	this.damage += power;
	if(this.kind==='e' && this.damage >= this.diedamage){
		this.tocull = true;
	}
};
Thing.prototype.onHit = function(t) {
	var o = null;
	if(this.kind==='pb' && t.kind==='e' && !this.hit){
		t.takedamage(this.power);
		//tell people that we hit an enemy
		eventlist.push(['de',t.ix,{'damage':this.power}]);
	}
	if(this.kind==='eb' && t.kind==='p' && !this.hit){
		t.takedamage(this.power);
	}
	
	//and now cull stuff
	this.tocull = true;
	this.hit = true;
	return o;
};


Thing.prototype.ai = function(){};

Thing.prototype.domove = function(){
	var t = this;
	var x = t.x + t.dx;
	var y = t.y + t.dy;
	if(t.maxage !== null && t.maxage < t.age){
		t.tocull = true;
		return;
	}
    if(t.cull_on_exit){
        if ( x - t.dr >  gamewidth*1000 || x + t.dr < 0 ||
             y - t.dr > gameheight*1000 || y + t.dr < 0){
			t.tocull = true;
			return;
		}
	}
	if(t.stop_on_exit){
		x = between(x,t.dr, gamewidth*1000-t.dr);
		y = between(y,t.dr,gameheight*1000-t.dr);
	}
	this.x = x;
	this.y = y;
	if(this.angle !== null){
		this.angle += this.omega;
	}

};

Thing.prototype.spawnPlayerBullet = function(d){
	var t = new Thing(this.spawnIndex(),'pb',this.int());
	t.x = this.x;
	t.y = this.y;
	t.dr = 100;
	t.cr = 100;
	t.speed = 800;
	t.dy = -t.speed;
	t.img = 'bullet';
	t.drawrotated = true;
	player_bullets[t.ix] = t;
	t.onCull = function() {
		if(this.hit){
			eventlist.push(['cpb',this.ix]);
		}
	};
	t.apply(d);
	eventlist.push(['npb',t.ix,t.summary()]);
	return t;
};

Thing.prototype.spawnEnemyBullet = function(d) {
	var t = new Thing(this.spawnIndex(),'eb',this.int());
	t.drawrotated = true;
	t.x = this.x;
	t.y = this.y;
	t.dr = 200;
	t.cr = 100;
	t.speed = 100;
	t.img = 'bullet';
	t.mode = 'down';
	t.target = this.target;
	enemy_bullets[t.ix]=t;
	
	t.apply(d);
	
	switch(t.mode){
	case 'aimed':
		var dx = t.target.x - t.x;
		var dy = t.target.y - t.y;
		var l = 1.0*Math.sqrt(dx*dx+dy*dy);
		t.dy = Math.floor(dy*t.speed/l);
		t.dx = Math.floor(dx*t.speed/l);
		break;
	case 'homing':
		t.ai = function(){
			var dx = this.target.x - this.x;
			var dy = this.target.y - this.y;
			var l = 1.0*Math.sqrt(dx*dx+dy*dy);
			this.dy = Math.floor(dy*this.speed/l);
			this.dx = Math.floor(dx*this.speed/l);
			Thing.prototype.ai.call(this);
		};
		break;
	default: //down is default
		t.dy = t.speed;
	}
	if('varx' in d){ t.dx += this.int(-d.varx,d.varx+1); }
	if('vary' in d){ t.dy += this.int(-d.vary,d.vary+1); }
	return t;
};
Thing.prototype.getangle = function() {
	if(this.angle !== null){
		return this.angle;
	}
	if(this.dx === 0 && this.dy >= 0){
		return 0.0;
	}
	return Math.atan2(this.dy,this.dx) - Math.PI/2;
};
Thing.prototype.drawRaw = function(x,y){
	var r = this.dr/1000.0;
	if(this.img === null){
		drawsquare(x,y,r);
	}else{
		gscontext.drawImage(images[this.img],x-r,y-r,2*r,2*r);
	}
};
Thing.prototype.draw = function(){
	var x = this.x/1000.0; var y = this.y/1000.0;
	if(this.drawrotated){
		var a = this.getangle();
		if(a!==0.0){
			gscontext.save();
			gscontext.translate(x,y);
			gscontext.rotate(a);
			this.drawRaw(0,0);
			gscontext.restore();
			return;
		}
	}
	this.drawRaw(x,y);
};

function newEnemy(){
	var t = new Thing(newIndex(),'e',grand.int());
	t.x = gamewidth*500;
	t.y = gameheight*500;
	t.dr = 200;
	t.cr = 300;
	t.cull_on_exit = false;
	t.tickspershot = 30;
	t.img = 'enemy';
	enemies[t.ix]=t;
	t.ai = function(){
		this.ai_dict = apply_ai.call(this,this.ai_dict);
		Thing.prototype.ai.call(this);
	};
	var target = 'p'+t.int(numplayers).toString(16);
	if(target in allies){
		t.target = allies[target];
	}else{
		t.target = player;
	}
	return t;
}
Thing.prototype.summary = function(excludes,prev) {
	//return object summarizing this one
	var base_excludes = {'inner_rand':true,'ai':true,
						 'gx0':true,'gx1':true,'gy0':true,'gy1':true};
	if(excludes === undefined){ excludes = {}; }
	if(prev === undefined){ prev = {}; }
	var o = {};
	for(var k in this){
		if(k in excludes){
			if(excludes[k]){ continue; }
		}else if(k in base_excludes){ continue; }
		if(! this.hasOwnProperty(k)){ continue; }
		var v = this[k];
		if(k in prev && prev[k] === this[k]){ continue; }
		if(typeof v === 'function'){ continue; }
		if(v === Thing.prototype[k]){ continue; }
		//if(v === this.__proto__[k]){ continue; }
		o[k] = v;
	}
	return o;
};
Thing.prototype.apply = function(d,excludes) {
	var base_excludes = {'kind':true,'seed':true,'ix':true,
						 'inner_rand':true,'ai':true};
	if(excludes === undefined){ excludes = {}; }
	for(var k in d){
		if(k in excludes){
			if(excludes[k]){ continue; }
		}else if(k in base_excludes){ continue; }
		var v = d[k];
		if(typeof v === 'function'){ continue; }
		this[k] = v;
	}
};


function newPlayer() {
	player = new Thing('p'+playernum.toString(16),playernum);
	player.x = (1+playernum)*gamewidth*1000/(1+numplayers);
	player.y = gameheight*800;
	player.kind = 'p';
	player.speed = 150;
	player.focusspeed = 80;
	player.stop_on_exit = true;
	player.weapons  = {'a':weap_lr('a',0.03),'b':weap_lr('b',0.09),'c':weap_st('c')};
	player.fweapons = {'a':weap_lr('a',0.10),'b':weap_lr('b',0.30),'c':weap_st('c')};
	
	player.ai = function(){
		var focus = isinput(INPUT_FOCUS);
		var speed = focus ? player.focusspeed : player.speed;
		var w, wk;
		
		if(display_vertical){
			player.dx = hdir===INPUT_LEFT ? -speed : hdir===INPUT_RIGHT ?  speed : 0;
			player.dy = vdir===INPUT_UP   ? -speed : vdir===INPUT_DOWN  ?  speed : 0;
		}else{
			player.dy = hdir===INPUT_LEFT ? speed  : hdir===INPUT_RIGHT ? -speed : 0;
			player.dx = vdir===INPUT_UP   ? -speed : vdir===INPUT_DOWN  ?  speed : 0;
		}
		if(isinput(INPUT_SHOOT1)){
			if(focus){
				for(wk in this.weapons){
					w = this.weapons[wk];
					w.fire(this);
				}
			}else{
				for(wk in this.fweapons){
					w = this.fweapons[wk];
					w.fire(this);
				}
			}
		}
		
		Thing.prototype.ai.call(this);
	};
	var o = player.summary();
	o.playernum = playernum;
	eventlist.push(['np',player.ix,o]);
	
}

function newAlly(ix, o){
	var t = new Thing(ix,'a',o.seed);
	t.apply(o);
	t.kind = 'a';
	allies[t.ix] = t;
	return t;
}
function newAllyBullet(ix, o){
	var t = new Thing(ix,'ab',o.seed);
	t.apply(o);
	t.kind = 'ab';
	ally_bullets[t.ix] = t;
	return t;
}


function thing_init(){
}



