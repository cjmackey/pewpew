

// parts for shipbuilding

function Weapon(ix) {
	this.ix = ix;
	this.kind = 'weapon';
}
Weapon.prototype.swivel = 'straight'; //'straight', 'angled', 'variable'
Weapon.prototype.barrels = 1;
Weapon.prototype.x = 0; //
Weapon.prototype.speed = 800;
Weapon.prototype.dx = 0; // 
Weapon.prototype.dy = -800; //
Weapon.prototype.vardx = 0;
Weapon.prototype.vardy = 0;
Weapon.prototype.max_ammo = 0; //0 = infinite
Weapon.prototype.ammo = 0;
Weapon.prototype.img = 'bullet';
Weapon.prototype.reloadtime = 6;
Weapon.prototype.reloadvar = 0;
Weapon.prototype.nextshot = 0;
Weapon.prototype.dr = 100;
Weapon.prototype.cr = 100;
Weapon.prototype.mass = 100;

Weapon.prototype.fire = function(t){
	//spawn bullet and such
	if(tick < this.nextshot){
		return;
	}
	var b = {};
	for(var sn = 0; sn < this.barrels; sn++){
		if(this.max_ammo > 0) {
			if(this.ammo < 1){
				return;
			}else{
				this.ammo -= 1;
			}
		}
		
		b.x = t.x;
		if(this.barrels > 1){
			b.x += Math.round(-this.x + 2*this.x*(sn/(1.0*(this.barrels-1))));
		}
		b.y = t.y;
		b.speed = this.speed;
		b.dx = 0;
		if(this.barrels > 1){
			b.dx += Math.round(-this.dx + 2*this.dx*(sn/(1.0*(this.barrels-1))));
		}
		b.dy = this.dy;
		if(this.vardx > 0){ b.dx += t.int(-this.vardx,this.vardx+1); }
		if(this.vardy > 0){ b.dy += t.int(-this.vardy,this.vardy+1); }
		b.cr = this.cr;
		b.dr = this.dr;
		b.img = this.img;
		
		t.spawnPlayerBullet(b);
	}
	
	this.nextshot = tick + this.reloadtime;
	if(this.reloadvar > 0){
		this.nextshot += t.int(-this.reloadvar,this.reloadvar+1);
	}
	
	return t;
};


function weap_st(ix) {
	var w = new Weapon(ix);
	w.dx = 0;
	w.x = 40;
	return w;
}
function weap_lr(ix,angle) {
	var w = new Weapon(ix);
	w.barrels = 2;
	w.x = 80;
	w.dx =  Math.round(w.speed*Math.sin(angle));
	w.dy = -Math.round(w.speed*Math.cos(angle));
	w.img = 'pinkball';
	return w;
}





function Chassis(ix) {
	this.ix = ix;
	this.kind = 'chassis';
}
Chassis.prototype.guncapacity = 1000;
Chassis.prototype.misccapacity = 1000;
Chassis.prototype.armor = 10000;
Chassis.prototype.mass = 1000;

function Build(name) {
	this.name = name;
	// each of these is just the ix of the part in question.
	this.chassis = null;
	this.engine = null;
	this.shield = null;
	this.guns = [];
	this.misc = [];
}
Build.prototype.parts = function() {
	var l = [this.chassis,this.engine,this.shield].concat(this.guns,this.misc);
	
};
Build.prototype.mass = function(){
	var l = this.parts();
	var s = 0;
	for(var i in l){
		s += l[i];
	}
	return s;
};
Build.prototype.isvalid = function(){
	var l = this.parts();
	for(var i in l){
		var t = l[i];
		if(!(t.ix in userobj.parts)){
			return false;
		}
	}
	return true;
};









function armory_init(){
}




