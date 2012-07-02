








//number of players in the current game
var numplayers;
//which player am i?
var playernum;
//identifier for the game
var gamekey;
//secret key for me in that game
var playerkey;
//input status
var istat;
var pinputs;

var player;

var eventlist = [];
var ineventlist;

var nextindex;

var enemies;
var player_bullets;
var enemy_bullets;
var allies;
var ally_bullets;

var cg_p;
var cg_b;

var gseed = 5817238411;
var grand;

function getThings() {
	return concat([player],allies,enemies,player_bullets,ally_bullets,enemy_bullets);
}

function startphysics() {
	
	tick = 0;
	nextindex = 0;
	eventlist = [];
	
	newPlayer();
	
	enemies = {};
	player_bullets = {};
	enemy_bullets = {};
	allies = {};
	ally_bullets = {};
}

function newIndex(){
	var o = nextindex;
	nextindex += 1;
	return o.toString(16);
}

function precollide(t) {
	t.steps = Math.max((307*(Math.abs(t.dx) + Math.abs(t.dy))/t.cr)>>8, 1);

	t.gx0 = between((Math.min(t.x,t.x+t.dx)-t.cr) >> 10, 0, gamewidth-1);
	t.gx1 = between((Math.max(t.x,t.x+t.dx)+t.cr) >> 10, 0, gamewidth-1);
	t.gy0 = between((Math.min(t.y,t.y+t.dy)-t.cr) >> 10, 0, gameheight-1);
	t.gy1 = between((Math.max(t.y,t.y+t.dy)+t.cr) >> 10, 0, gameheight-1);
}
function insertgrid(t, g) {
	for(var i = t.gx0; i <= t.gx1; i++){
		for(var j = t.gy0; j <= t.gy1; j++){
			g[i][j].push(t.ix);
		}
	}
}

function collide_one(t1,t2,m){
	var dx = Math.abs(t1.x + t1.dx*m - t2.x - t2.dx*m);
	var dy = Math.abs(t1.y + t1.dy*m - t2.y - t2.dy*m);
	var cr = t1.cr+t2.cr;
	//square collision detection
	return ((dx<=cr) && (dy<=cr));
}

function collide_continuous(t1,t2){
	//alert([t1,t2]);
	var steps = Math.max(t1.steps,t2.steps);
	var os = 1.0/steps;
	for(var i = 0; i < steps; i++){
		if(collide_one(t1,t2,os*i)){ return true; }
	}
	return false;
}

function collide_continuous_v2(t1,t2){
	var dx = t1.x - t2.x;
	var dy = t1.y - t2.y;
	var cr = t1.cr+t2.cr;
	var hitx; // least m that x's overlap
	var hity; // least m that y's overlap
	if(dx > cr){        // t1 is far to the right of t2
		if(t1.dx >= t2.dx){ // and t2 will never catch up
			return false;
		}else{ // t2 might catch up
			// t1.x + m*t1.dx = t2.x + cr + m*t2.dx
			// m*dx1 - m*dx2 = x2-x1+cr
			// m*(dx1-dx2) = x2-x1+cr
			// m = (x2-x1+cr)/(dx1-dx2)
			hitx = (t2.x-t1.x+cr)/(1.0*(t1.dx-t2.dx));
		}
	}else if(dx < -cr){ // t1 is far to the left of t2
		if(t1.dx <= t2.dx){
			return false;
		}else{
			hitx = (t2.x-t1.x-cr)/(1.0*(t1.dx-t2.dx));
		}
	}else{ // overlap in x axis
		hitx = 0.0;
	}
	if(hitx > 1.0){
		return false;
	}
	if(dy > cr){
		if(t1.dy >= t2.dy){
			return false;
		}else{ // t2 might catch up
			hity = (t2.y-t1.y+cr)/(1.0*(t1.dy-t2.dy));
		}
	}else if(dy < -cr){ // t1 is far to the left of t2
		if(t1.dy <= t2.dy){
			return false;
		}else{
			hity = (t2.y-t1.y-cr)/(1.0*(t1.dy-t2.dy));
		}
	}else{ // overlap in y ayis
		hity = 0.0;
	}
	if(hity > 1.0){
		return false;
	}
	var m = Math.max(hitx,hity);
	if(collide_one(t1,t2,m)){
		return m;
	}
	return false;
}

function collide_continuous_v3(t1,t2){
	var a = 1.0*t1.x;
	var b = 1.0*t1.dx;
	var c = 1.0*t2.x;
	var d = 1.0*t2.dx;
	var e = 1.0*t1.y;
	var f = 1.0*t1.dx;
	var g = 1.0*t2.y;
	var h = 1.0*t2.dy;
	var r = 1.0*t1.cr + 1.0*t2.cr;
	
	var k = (a-c);
	var l = (e-g);
	if(Math.sqrt(k*k+l*l)<=r){ return 0.0; }
	
	var m1 = (-Math.sqrt((2*a*b-2*a*d-2*b*c+2*c*d+2*e*f-2*e*h-2*f*g+2*g*h)^2 - 4*(b*b-2*b*d+d*d+f*f-2*f*h+h*h)*(a*a-2*a*c+c*c+e*e-2*e*g+g*g-r*r)) - 2*a*b+2*a*d+2*b*c-2*c*d-2*e*f+2*e*h+2*f*g-2*g*h)/(2*(b*b-2*b*d+d*d+f*f-2*f*h+h*h));
	var m2 = ( Math.sqrt((2*a*b-2*a*d-2*b*c+2*c*d+2*e*f-2*e*h-2*f*g+2*g*h)^2 - 4*(b*b-2*b*d+d*d+f*f-2*f*h+h*h)*(a*a-2*a*c+c*c+e*e-2*e*g+g*g-r*r)) - 2*a*b+2*a*d+2*b*c-2*c*d-2*e*f+2*e*h+2*f*g-2*g*h)/(2*(b*b-2*b*d+d*d+f*f-2*f*h+h*h));
	var m = 2.0;
	
	if(m1 <= 1.0 && m1 >= 0.0){ m = m1; }
	if(m2 <= 1.0 && m2 >= 0.0){ m = Math.min(m,m2); }
	if(m <= 1.0){
		return m;
	}
	return false;
}



function precollide_things(){
	var i;
	
	precollide(player);
	insertgrid(player,cg_p);
	for(i in allies){
		precollide(allies[i]);
		insertgrid(allies[i],cg_p);
	}
	for(i in player_bullets){
		precollide(player_bullets[i]);
		insertgrid(player_bullets[i],cg_b);
	}
	for(i in enemies){
		precollide(enemies[i]);
	}
	for(i in enemy_bullets){
		precollide(enemy_bullets[i]);
	}
}

function collide_enemies(){
	var b, e;
	var collisions = [];
	for(var ei in enemies){
		e = enemies[ei];
		var bset = {}; // set to ensure we don't double count
		for(var i = e.gx0; i <= e.gx1; i++){
			for(var j = e.gy0; j <= e.gy1; j++){
				var l = cg_b[i][j];
				for(var ai=l.length-1; ai>=0; --ai ){
					b = player_bullets[l[ai]];
					if(!(b.ix in bset)){
						bset[b.ix] = true;
						var m = collide_continuous_v2(b,e);
						if(m !== false){
							collisions.push([m,b,e]);
						}
					}
				}
			}
		}
	}
	collisions.sort();
	for(var ci = 0; ci < collisions.length; ci++){
		b = collisions[ci][1];
		e = collisions[ci][2];
		if(!(b.tocull||e.tocull)){ //neither will be culled
			b.onHit(e);
		}
	}
}
function collide_players(){
	var b, p;
	var collisions = [];
	for(var bi in enemy_bullets){
		b = enemy_bullets[bi];
		var pset = {}; // set to ensure we don't double count
		for(var i = b.gx0; i <= b.gx1; i++){
			for(var j = b.gy0; j <= b.gy1; j++){
				var l = cg_p[i][j];
				for(var ai=0; ai<l.length; ai++){
					p = l[ai] === player.ix ? player : allies[l[ai]];
					if(!(p.ix in pset)){
						pset[p.ix] = true;
						var m = collide_continuous_v2(b,p);
						if(m !== false){
							collisions.push([m,b,p]);
						}
					}
				}
			}
		}
	}
	collisions.sort();
	for(var ci = 0; ci < collisions.length; ci++){
		b = collisions[ci][1];
		p = collisions[ci][2];
		if(!(b.tocull||p.tocull)){ //neither has been designated to be culled
			b.onHit(p);
		}
	}
}


function thinglist() {
	return [[player],allies,enemies,enemy_bullets,player_bullets,ally_bullets];
}

function ai_things() {
	var tll = thinglist();
	for(var li in tll){
		var tl = tll[li];
		for(var i in tl){
			var t = tl[i];
			t.ai();
		}
	}
}

function move_things() {
	var tll = thinglist();
	for(var li in tll){
		var tl = tll[li];
		for(var i in tl){
			var t = tl[i];
			t.domove();
		}
	}
}

function cull_things() {
	var tll = thinglist();
	for(var li in tll){
		var tl = tll[li];
		for(var i in tl){
			var t = tl[i];
			if(t.tocull){
				t.onCull();
				delete tl[i];
			}
		}
	}
}

function count_things() {
	var k;
	num_enemies = 0;
	num_enemy_bullets = 0;
	num_allies = 0;
	num_ally_bullets = 0;
	for(k in enemies) { num_enemies++; }
	for(k in enemy_bullets) { num_enemy_bullets++; }
	for(k in allies) { num_allies++; }
	for(k in ally_bullets) { num_ally_bullets++; }
}

function physicsstep() {
	var playerexcludes = {'kind':true,'stop_on_exit':true,
						  'weapons':true,'fweapons':true,'nextindex':true,
						  'speed':true,'focusspeed':true};
	var prevplayer = player.summary(playerexcludes);
	var i;
	cg_p = arr2(gamewidth,gameheight);
	cg_b = arr2(gamewidth,gameheight);
	num_enemies = 0;
	num_enemy_bullets = 0;
	num_allies = 0;
	
	ai_things();
	precollide_things();
	collide_enemies();
	collide_players();
	move_things();
	cull_things();
	count_things();
	
	eventlist.push(['p',player.ix,player.summary(playerexcludes,prevplayer)]);
}

function physics_init(){
	
}





