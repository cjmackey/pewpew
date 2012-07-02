

var gscanvas;
var gscontext;

function drawsquare(x,y,r,ctx){
	if(ctx === undefined){
		ctx = gscontext;
	}
	ctx.fillRect(x-r,y-r,2*r,2*r);
}

function drawcircle(x,y,r,ctx){
	if(ctx === undefined){
		ctx = gscontext;
	}
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2, false);
	ctx.closePath();
	ctx.fill();
}

function clearscene() {
	gscontext.clearRect(0,0,gscanvas.width,gscanvas.height);
}


var images = {};
var canvid = 0;


function canv_image_hash(){
	var data = this.ctx().getImageData(0,0,this.width,this.height);
	var output = '';
	/*
	  var w = data.width;
	  var h = data.height;
	  for (var x = 0; x < w; x++) {
	  for (var y = 0; y < h; y++) {
	  var offset = (y * w + x) * 4;
	  var r = data.data[offset];
	  var g = data.data[offset + 1];
	  var b = data.data[offset + 2];
	  var a = data.data[offset + 3];
	  
	  }
	  }
	*/
	var l = data.data.length;
	for(var i = 0; i < l; i++){
		output += String.fromCharCode(data.data[i]);
	}
	return Sha1.hash(output,false);
}

function canv_ctx(){
	return this.getContext("2d");
}

function canvas_init(width, height, id){
	if(width === undefined){
		width = 100;
	}
	if(height === undefined){
		height = 100;
	}
	if(id === undefined){
		id = 'canvas'+canvid.toString();
		canvid += 1;
	}
	$('body').append('<canvas id="' + id + '" class="superhidden" width="'+width.toString()+'" height="'+height.toString()+'"></canvas>');
	var canv = document.getElementById(id);
	canv.ctx = canv_ctx;
	canv.hash = canv_image_hash;
	return canv;
}

function image_url(path){
	return cdn+'images.'+builddate+'/'+path;
}

function image_init(path){
	var canv = canvas_init();
	var ctx = canv.ctx();
	var img = new Image();
	img.onload = function(){
		canv.width = img.width;
		canv.height = img.height;
		ctx.drawImage(img,0,0);
	};
	img.src = image_url(path);
	return canv;
}

var display_vertical = true;
var oldwindowheight = null;
var oldwindowwidth = null;

function recanvas(){
	var wh = $(window).height();
	var ww = $(window).width();
	if(wh === oldwindowheight && ww === oldwindowwidth){ return; }
	oldwindowheight = wh;
	oldwindowwidth = ww;
	
	gscanvas = document.getElementById("gs");
	var s = 100; // reserving for side stuff
	var f = 100; //reserving for the footer
	var h = between(oldwindowheight - f,100,100000);
	var w = between(oldwindowwidth - s,100,100000);
	var gh = display_vertical ? gameheight : gamewidth;
	var gw = display_vertical ? gamewidth : gameheight;
	var ch = h;
	var cw = w;
	
	if(h/(1.0*w) < gh/(1.0*gw)){
		//if screen is wider than the game, base things off its height
		cw = Math.round(h*gw/(1.0*gh));
	}else{
		ch = Math.round(w*gh/(1.0*gw));
	}
	gscanvas.height = ch;
	gscanvas.width = cw;
	$('#gs').css('margin-left',-cw/2);
	$('#gs').css('margin-top', 0);
	$('#gs').css('top', 0);
	
	gscontext = gscanvas.getContext("2d");
	
	gscontext.restore();
	if(display_vertical){
		gscontext.scale(gscanvas.width/(1.0*gamewidth),gscanvas.height/(1.0*gameheight));
	}else{
		gscontext.scale(gscanvas.height/(1.0*gamewidth),gscanvas.width/(1.0*gameheight));
		gscontext.rotate(Math.PI/2.0);
		gscontext.translate(0,-gameheight);
	}
	//if(!display_vertical){
	//		gscontext.translate(-gamewidth/2.0,-gameheight/2.0
	//}
	gscontext.save();
}


function graphics_init() {
	
	recanvas();
	
	images.bullet = image_init('y18.gif');
	
	var enemy_img = canvas_init();
	drawcircle(50,50,50,enemy_img.ctx());
	images.enemy = enemy_img;
	
	var img = canvas_init();
	var g = img.ctx().createRadialGradient(50,50,0,50,50,50);
	g.addColorStop(0,"rgba(255, 100, 100, 255)");
	g.addColorStop(1,"rgba(255, 100, 100, 0)");
	//g.addColorStop(0,"#faa");
	//g.addColorStop(1,"#fff");
	img.ctx().fillStyle = g;
	drawcircle(50,50,50,img.ctx());
	images.pinkball = img;
	
}

var bgpattern;
var bgscale = 10.0;

function drawscene() {
	var i, e, b, x, y, r, a;
	clearscene();
	recanvas();
	
	/*
	gscontext.save();
	gscontext.translate(0,tick/30.0);
	gscontext.scale(1.0/bgscale,1.0/bgscale);
	bgpattern = gscontext.createPattern(images.bullet,'repeat');
	gscontext.fillStyle = bgpattern;
	//gscontext.fillRect(0,0,10,10);//gamewidth,gameheight);
	gscontext.fillRect(0,0,gamewidth*bgscale,gameheight*bgscale);
	gscontext.restore();
	*/
	
	for(i in enemies){
		enemies[i].draw();
	}
	
	gscontext.fillStyle = '#0f0';
	//drawsquare(player.x/1000.0,player.y/1000.0,player.dr/1000.0);
	//drawcircle(player.x/1000.0,player.y/1000.0,player.dr/1000.0);
	player.draw();
	
	gscontext.fillStyle = '#00f';
	for(i in allies){
		allies[i].draw();
	}
	
	for(i in enemy_bullets){
		enemy_bullets[i].draw();
	}
	for(i in player_bullets){
		player_bullets[i].draw();
	}
	for(i in ally_bullets){
		ally_bullets[i].draw();
	}
}






