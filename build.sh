#!/bin/sh

BASEDIR=$(dirname $0)
cd $BASEDIR
mkdir -p output
mkdir -p outputnew
kill `cat _server.pid` 2>/dev/null
rm _server.pid 2>/dev/null
touch _server.pid 2>/dev/null

if mongo localhost /dev/null 1>/dev/null 2>/dev/null
then
	echo "lalala" >/dev/null
else
	echo "starting ssh tunnel"
	ssh -N -L 27017:localhost:27017 carl@beyondkaoru.net &
fi

html=outputnew/index.html
d=`date '+%s'`.`date '+%N' | cut -b -3`
clientjs="util rand userclient footer hangar net armory thing mission AI physics graphics input pewpew"
serverjs="util configserver includeserver userserver gameserver server"
debug=0
opt=0
port=8080
host=localhost

if [ `hostname` = marl ]
then
	host=beyondkaoru.net
fi

while getopts doh:p: o
do
		case "$o" in
				d) debug=1 ;;
				o) opt=1 ;;
				h) host="$OPTARG";;
				p) port="$OPTARG";;
		esac
done

cdn="http://$host:$port/";


#running jslint

for f in $clientjs $serverjs
do
		if [ -f $f.js ]
		then
				checksum=`md5sum $f.js|cut -b-32`
				if grep -q "$checksum" _jslintpassed 2>/dev/null >/dev/null
				then
						echo found $checksum >> /dev/null
				else
						node fulljslint.js $f.js > _jslinttmp
						if grep -q -x "jslint: No problems found.*" _jslinttmp
						then
								echo $checksum >> _jslintpassed
						else
								cat _jslinttmp
						fi
						rm _jslinttmp
				fi
		fi
done



# begin generating javascript files
rm _client.js 2>/dev/null
rm _server.js 2>/dev/null
rm _toinit.js 2>/dev/null

if [ $debug -eq 1 ]
then
		echo "\"use strict\";" > _client.js
		echo "\"use strict\";" > _server.js
fi

# client javascript

echo "" >> _client.js
echo "//builddate: identifier for the build" >> _client.js
echo "var builddate = '$d';" >> _client.js
echo "" >> _client.js
echo "//cdn: url segment for where to get files" >> _client.js
echo "var cdn = '$cdn';" >> _client.js
echo "var port = $port;" >> _client.js

for f in $clientjs
do
		if [ -f $f.js ]
		then
				echo "${f}_init();" >> _toinit.js
				echo "" >> _client.js
				echo "//////// $f.js" >> _client.js
				echo "" >> _client.js
				cat $f.js >> _client.js
		fi
done

echo "//////// document ready stuff" >> _client.js
echo "\$(document).ready(function(){" >> _client.js
cat _toinit.js >> _client.js
echo '});' >> _client.js
rm _toinit.js 2>/dev/null

#server javascript

echo "" >> _server.js
echo "var port = $port;" >> _server.js
echo "var mongoport = 27017;" >> _server.js
echo "var mongoauth = 0;" >> _server.js

for f in $serverjs
do
		if [ -f $f.js ]
		then
				echo "" >> _server.js
				echo "//////// $f.js" >> _server.js
				echo "" >> _server.js
				cat $f.js >> _server.js
		fi
done

#if [ $opt -eq 1 ]
#then
#		cd packer
#		perl ./jsPacker.pl -i ../_client.js -o ../_client-min.js -e62 -f
#		cd ..
#		mv _client-min.js _client.js
#fi

#todo: if optimizing, maybe minify the javascript







# starting to make index.html
echo "<!DOCTYPE html>" >> $html
echo "<html><head>" >> $html

f1=style.$d.css
cp style.css outputnew/$f1
echo "<link rel='stylesheet' href='$f1'>" >> $html

echo "</head><body>" >> $html


#date javascript files and copy them to output/
for f in jquery-1.5.2 json sha1 sockio _client
do
		f1=$f.$d.js
		cp $f.js outputnew/$f1
		echo "<script src=\"$f1\"></script>" >> $html
done

echo "<canvas id=\"gs\" width=\"270\" height=\"480\"></canvas></body></html>" >> $html


#date and copy images to output/
cp -r images outputnew/images.$d

rm -rf outputold 2>/dev/null
mv output outputold
mv outputnew output

if [ $debug -eq 1 ]
then
		node _server.js
else
		node _server.js >>_server.log 2>>_server.err &
fi








