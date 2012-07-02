
/*
  from: view-source:http://www.graviness.com/js/mt19937ar.c.js.phtml
*/

/*
  This program is a JavaScript version of Mersenne Twister,
  conversion from the original program (mt19937ar.c),
  translated by yunos on december, 6, 2008.
  If you have any questions about this program, please ask me by e-mail.
  e-mail: info @ graviness.com
  

*/



/* 
   A C-program for MT19937, with initialization improved 2002/1/26.
   Coded by Takuji Nishimura and Makoto Matsumoto.
   
   Before using, initialize the state by using init_genrand(seed)  
   or init_by_array(init_key, key_length).
   
   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.                          
   
   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:
   
   1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
   
   2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
   
   3. The names of its contributors may not be used to endorse or promote 
   products derived from this software without specific prior written 
   permission.
   
   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   
   
   Any feedback is very welcome.
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
   email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/

//#include &lt;stdio.h&gt;


function Rand(seed) {
	
	this.mt = [];
	this.mti = this.N+1;
	
	this.seed(seed);
}

Rand.prototype.N = 624;
Rand.prototype.M = 397;
Rand.prototype.MATRIX_A = 0x9908b0df;   /* constant vector a */
Rand.prototype.UPPER_MASK = 0x80000000; /* most significant w-r bits */
Rand.prototype.LOWER_MASK = 0x7fffffff; /* least significant r bits */
Rand.prototype.seed = function(s){
	switch(typeof s){
	case 'number': return this.seedint(s);
	case 'undefined': return this.seedint(time_ms());
	default:
		if(s===null){
			return undefined;
		}else{
			alert('error in rand.js: calling seed with strange type: '+(typeof s));
		}
	}
};
/* initializes mt[N] with a seed */
Rand.prototype.seedint = function(s) {
	var mti = this.mti, N = this.N, mt = this.mt;
    mt[0]= s >>> 0;
    for (mti=1; mti<N; mti++) {
        s = mt[mti-1] ^ (mt[mti-1] >>> 30);
		mt[mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + mti;
        /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
        /* In the previous versions, MSBs of the seed affect   */
        /* only MSBs of the array mt[].                        */
        /* 2002/01/09 modified by Makoto Matsumoto             */
        mt[mti] >>>= 0;
        /* for >32 bit machines */
    }
	this.mti = mti;
	this.mt = mt;
};

/* initialize by an array with array-length */
/* init_key is the array for initializing keys */
/* key_length is its length */
/* slight change for C++, 2004/2/26 */
function init_by_array(init_key, key_length)
{
    var i, j, k, s;
    init_genrand(19650218);
    i=1; j=0;
    k = (N>key_length ? N : key_length);
    for (; k; k--) {
        s = mt[i-1] ^ (mt[i-1] >>> 30);
        mt[i] = (mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1664525) << 16) + ((s & 0x0000ffff) * 1664525))) + init_key[j] + j; /* non linear */
        mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
        i++; j++;
        if (i>=N) { mt[0] = mt[N-1]; i=1; }
        if (j>=key_length){ j=0; }
    }
    for (k=N-1; k; k--) {
        s = mt[i-1] ^ (mt[i-1] >>> 30);
        mt[i] = (mt[i] ^ (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) + (s & 0x0000ffff) * 1566083941)) - i; /* non linear */
        mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
        i++;
        if (i>=N) { mt[0] = mt[N-1]; i=1; }
    }
	
    mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */ 
}

/* generates a random number on [0,0xffffffff]-interval */
Rand.prototype.int32 = function(){
    var y;
    var mag01 = [0, this.MATRIX_A];
    /* mag01[x] = x * MATRIX_A  for x=0,1 */
	var mti = this.mti, mt = this.mt, N = this.N;
	
    if (mti >= N) { /* generate N words at one time */
        var kk;
		var M = this.M, UPPER_MASK = this.UPPER_MASK, LOWER_MASK = this.LOWER_MASK;
		
        if (mti === N+1){   /* if init_genrand() has not been called, */
            this.seedint(5489); /* a default initial seed is used */
		}
        for (kk=0;kk<N-M;kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
            mt[kk] = mt[kk+M] ^ (y >>> 1) ^ mag01[y & 0x1];
        }
        for (;kk<N-1;kk++) {
            y = (mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK);
            mt[kk] = mt[kk+(M-N)] ^ (y >>> 1) ^ mag01[y & 0x1];
        }
        y = (mt[N-1]&UPPER_MASK)|(mt[0]&LOWER_MASK);
        mt[N-1] = mt[M-1] ^ (y >>> 1) ^ mag01[y & 0x1];
		
        mti = 0;
    }
	
    y = mt[mti++];
	
    /* Tempering */
    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);
	
	this.mti = mti;
	this.mt = mt;
	
    return y >>> 0;
};

/* generates a random number on [0,0x7fffffff]-interval */
Rand.prototype.int31 = function() {
    return (this.int32()>>>1);
};

/* generates an integer in range [a,b), or [0,a), or [0,2^32) */
Rand.prototype.int = function(a,b){
	if(b === undefined){
		if(a === undefined){
			return this.int32();
		}else{
			return this.intraw(a);
		}
	}else{
		return this.intraw(b-a)+a;
	}
};
Rand.prototype.intraw = function(m){
	//note: this needs altering if m is somewhat large
	var i = this.int32();
	return i % m;
};

/* generates a random number on [a,b), [0,a), or [0,1)-real-interval */
Rand.prototype.real = function(a,b) {
	if(b === undefined){
		if(a === undefined){
			return this.real1();
		}else{
			return this.real1()*a;
		}
	}else{
		return this.real1()*(b-a)+a;
	}
};
/* generates a random number on [0,1)-real-interval */
Rand.prototype.real1 = function() {
	return this.int32()*(1.0/4294967296.0); 
	/* divided by 2^32 */
};


function rand_init(){
	/*
	  var r1 = new Rand(1), r2 = new Rand(2), r3 = new Rand(3), r4 = new Rand(), r5 = new Rand(), r6 = new Rand(null);
	  alert(r1.int() + ' ' + r2.int() + ' ' + r3.int() + ' ' + r4.int() + ' ' + r5.int() + ' ' + r6.int());
	*/
}

