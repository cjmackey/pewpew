








function hash_password(username, password, n){
	if(n === undefined) { n = 100; }
	var h0 = '';
	h0 += Sha1.hash(username);
	h0 += Sha1.hash(password);
	h0 += Sha1.hash(username+'|||||'+password);
	h0 += Sha1.hash(password+'|||||'+username);
	return Sha1.hashrepeat(h0,n);
}








var isock;
var isocklistener = null;

var username;
var hashpass;
var userobj;

var loginorregister_init;
var loginorregister_stop;
var login_init;
var login_stop;
var register_init;
var register_stop;
var mainmenu_init;
var mainmenu_stop;
var singleplayer_init;
var singleplayer_stop;


loginorregister_init = function(){
	$('body').append('<div id="lorr" class="overlay"></div>');
	$('#lorr').append('<div id="login_button">login</div>');
	$('#lorr').append('<div id="register_button">register</div>');
	$('#login_button').click(function(){
		loginorregister_stop();
		login_init();
	});
	$('#register_button').click(function(){
		loginorregister_stop();
		register_init();
	});
};
loginorregister_stop = function (){
	$('#lorr').remove();
};

login_init = function (){
	$('body').append('<div id="login" class="overlay"></div>');
	$('#login').append('<form>');
	$('#login').append('Username: <input id="username" type="text" size="15" /><br>');
	$('#login').append('Password: <input id="password" type="password" size="15" /><br>');
	$('#login').append('<div id="login_button">login</div><br>');
	$('#login').append('</form>');
	$('#username').focus();
	var submit = function(){
		username = $('#username').val();
		var password = $('#password').val();
		hashpass = hash_password(username,password);
		console.log([username,password,hashpass]);
		isocklistener = function(o){
			if(o.success === true){
				console.log('login success');
				login_stop();
				userobj = o.obj;
				mainmenu_init();
			}else{
				$('#login_err').remove();
				$('#login').append('<div id="login_err">login failed</div><br>');
			}
		};
		isock.send({
			'a':'login',
			'username':username,
			'hashpass':hashpass
		});
		//todo: use a loading symbol or something
	};
	$('#login_button').click(submit);
	$('#login').keydown(function(ev){
		if(ev.which === 13){submit();}
		return true;
	});
};
login_stop = function (){
	$('#login').remove();
};

register_init = function (){
	$('body').append('<div id="register" class="overlay"></div>');
	$('#register').append('<form>');
	$('#register').append('Username: <input id="username" type="text" size="15" /><br>');
	$('#register').append('Password: <input id="password" type="password" size="15" /><br>');
	$('#register').append('<div id="register_button">register</div><br>');
	$('#register').append('</form>');
	$('#username').focus();
	var submit = function(){
		username = $('#username').val();
		var password = $('#password').val();
		hashpass = hash_password(username,password);
		console.log([username,password,hashpass]);
		isocklistener = function(o){
			if(o.success === true){
				console.log('register success');
				register_stop();
				userobj = o.obj;
				mainmenu_init();
			}else{
				$('#register_err').remove();
				$('#register').append('<div id="register_err">register failed</div><br>');
			}
		};
		isock.send({
			'a':'register',
			'username':username,
			'hashpass':hashpass
		});
		//todo: use a loading symbol or something
	};
	$('#register_button').click(submit);
	$('#register').keydown(function(ev){
		if(ev.which === 13){submit();}
		return true;
	});
};
register_stop = function (){
	$('#register').remove();
};

mainmenu_init = function (){
	$('body').append('<div id="mainmenu" class="overlay"></div>');
	$('#mainmenu').append('<div id="singleplayer">single player</div>');
	$('#singleplayer').click(function(){
		mainmenu_stop();
		singleplayer_init();
	});
};
mainmenu_stop = function (){
	$('#mainmenu').remove();
};
singleplayer_init = function (){
	function singleplayer_mission_init(k){
		return function(){
			prep_game(k,time_ms());
			singleplayer_stop();
			gameloop();
		};
	}
	$('body').append('<div id="singleplayer" class="overlay"></div>');
	for(var k in mission_list){
		$('#singleplayer').append('<div id="mission_'+k+'">'+k+'</div>');
		$('#mission_'+k).click(singleplayer_mission_init(k));
	}
};
singleplayer_stop = function (){
	$('#singleplayer').remove();
};



function userclient_init(){
	isock = new io.Socket(null, {'port': port, 'rememberTransport': false});
	isock.connect();
	isock.on('message', function(obj){
		if(isocklistener === null){ return; }
		if(!isocklistener(obj)){
			isocklistener = null;
		}
	});
}
