
//map from input code to key code
var key2inputmap;
//map from key code to input code
var input2keymap;
//the current keys that are down (map int->true or (false/undefined))
var keysdown;
var vdir;
var hdir;

var INPUT_NEUTRAL = 0;
var INPUT_UP      = 1;
var INPUT_DOWN    = 2;
var INPUT_LEFT    = 3;
var INPUT_RIGHT   = 4;
var INPUT_FOCUS   = 5;
var INPUT_SHOOT1  = 6;

function iskeydown(k){
	return (keysdown[k] === true);
}
function isinput(i){
	return iskeydown(input2keymap[i]);
}

function inputmaps_init(){
	input2keymap = [];
	input2keymap[INPUT_NEUTRAL] =  0;
	input2keymap[INPUT_UP]      = 38;
	input2keymap[INPUT_DOWN]    = 40;
	input2keymap[INPUT_LEFT]    = 37;
	input2keymap[INPUT_RIGHT]   = 39;
	input2keymap[INPUT_FOCUS]   = 16; //shift
	input2keymap[INPUT_SHOOT1]  = 32; //space
	key2inputmap = [];
	for(var i = 0; i < input2keymap.length; i++){
		key2inputmap[input2keymap[i]] = i;
	}
}

function vdef(){
	if(isinput(INPUT_UP) && !isinput(INPUT_DOWN)){
		return INPUT_UP;
	}else if(isinput(INPUT_DOWN) && !isinput(INPUT_UP)){
		return INPUT_DOWN;
	}
	return INPUT_NEUTRAL;
}

function hdef(){
	if(isinput(INPUT_LEFT) && !isinput(INPUT_RIGHT)){
		return INPUT_LEFT;
	}else if(isinput(INPUT_RIGHT) && !isinput(INPUT_LEFT)){
		return INPUT_RIGHT;
	}
	return INPUT_NEUTRAL;
}

function input_init(){
	inputmaps_init();
	keysdown = [];
	vdir = INPUT_NEUTRAL;
	hdir = INPUT_NEUTRAL;
	
	$(document).keydown(function(ev){
		keysdown[ev.which] = true;
		
		switch(key2inputmap[ev.which]){
		case INPUT_UP:
			vdir = INPUT_UP;
			break;
		case INPUT_DOWN:
			vdir = INPUT_DOWN;
			break;
		case INPUT_LEFT:
			hdir = INPUT_LEFT;
			break;
		case INPUT_RIGHT:
			hdir = INPUT_RIGHT;
			break;
		}
		
		return true;
	});
	$(document).keyup(function(ev){
		keysdown[ev.which] = false;
		
		var i = key2inputmap[ev.which];
		if(i === INPUT_UP || i === INPUT_DOWN){
			vdir = vdef();
		}else if(i === INPUT_LEFT || i === INPUT_RIGHT){
			hdir = hdef();
		}
		
		return true;
	});
}




