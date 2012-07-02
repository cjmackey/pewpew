

//returns a value in [mi,ma], preferring x.
function between(x,mi,ma){
	if(x < mi){
		x = mi;
	}else if(x > ma){
		x = ma;
	}
	return x;
}

function assert(expr,mesg) {
	if(!expr){
		if(mesg===undefined){
			mesg = 'assertion error: ' + assert.caller.toString();
		}
		alert(mesg);
	}
}

function time_ms(){
	return (new Date()).getTime();
}
function time_s(){
	return time_ms()/1000.0;
}

function isArray(obj){
	return (obj.constructor.toString().indexOf("Array") !== -1);
}

function copyarr(a){
	var l = [], i;
	for(i = 0; i < a.length; i+=1){
		l.push(a[i]);
	}
	return l;
}

function arr2(w,h) {
	//apparently this is pretty fast :)
	var a = [], b, i, j;
	for(i = 0; i < w; i+=1){
		b = [];
		for(j = 0; j < h; j+=1){
			b.push([]);
		}
		a.push(b);
	}
	return a;
}



var gamewidth = 12;
var gameheight = 15;



function util_init() {
	var d = {}, a = [], x = 0, l = [], i;
	for(i in a){
		x+=1;
		l.push(i);
	}
	assert(x===0,'empty array isn\'t actually empty! '+l.toString());
	
	x = 0;
	l = [];
	for(i in d){
		x+=1;
		l.push(i);
	}
	assert(x===0,'empty object isn\'t actually empty! '+l.toString());
	
}




