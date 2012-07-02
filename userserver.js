
/*

user's mongodb schema


*/

var usercache = {};

//JSON.stringify
//JSON.parse

function validUsername(u){
	return (typeof u === 'string' && u.length < 30 && /^[a-zA-Z0-9]+$/.test(u));
}

function auth_user(username,hashpass,f){
	var db;
	var coll;
	var t = time_s();
	seq(
		function(){ dbconn(this); },
		function(d){
			db = d;
			db.collection('users',this);
		},
		function(err,collection){
			coll = collection;
			coll.find({'username':username,'hashpass':hashpass},{'limit':1},this);
		},
		function(a,b){b.toArray(this);},
		function(a,b){
			if(b.length === 0){
				f(null);
			}else{
				f(b[0]);
			}
		}
	);
	
}
function new_user(username,hashpass,f){
	var db;
	var coll;
	var t = time_s();
	var o;
	seq(
		function(){ dbconn(this); },
		function(d){
			db = d;
			db.collection('users',this);
		},
		function(err,collection){
			coll = collection;
			coll.insert(
				{'username':username,
				 'hashpass':hashpass,
				 'created':t,
				 'thingid':0,
				 'builds':{}, // name -> build
				 'parts':{}, // id -> part
				 'goods':{} // thingname -> how many (eg, 1000 units of iron)
				},
				this);
		},
		function(err,b){
			if(err){ console.log(err); }
			coll.find({'username':username},{'limit':1},this);
		},
		function(a,b){b.toArray(this);},
		function(a,b){
			if(b[0].created === t){
				f(b[0]);
			}else{
				f(null);
			}
		}
	);
}

function user_index(f){
	var db;
	var coll;
	seq(
		function(){ dbconn(this); },
		function(d){
			db = d;
			db.collection('users',this);
		},
		function(err,collection){
			coll = collection;
			coll.createIndex({'username':1},{'unique':true});
		},
		f
	);
}

/*
  performs adjustments on a user; called on login.
*/
function adjust_user(u){
	//todo: check for whether things need changes, change them, and mark changed as true
	//todo: put changes into db...?
}

/*
  after someone has logged in or created a user, this will reply with success or failure, and a copy of the user object.
*/
function postlogin(c,m,o){
	var r = {'success': o !== null};
	if(r.success){
		r.obj = o;
		adjust_user(o);
		c.send({
			'success': true,
			'obj': o
		});
		clientusername[c.sessionId] = m.username;
		usernameclient[m.username] = c.sessionId;
		console.log('Client '+c.sessionId+' successful '+m.a);
	}else{
		console.log('Client '+c.sessionId+' failed '+m.a);
	}
	if(m.a.length > 1){
		c.send(r);
	}
}

function userlogin(c,m){
	auth_user(m.username,m.hashpass,function(o){ postlogin(c,m,o); });
}

function usercreate(c,m){
	new_user(m.username,m.hashpass,function(o){ postlogin(c,m,o); });
}










