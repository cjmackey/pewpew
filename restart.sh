#!/bin/sh

BASEDIR=$(dirname $0)
cd $BASEDIR
mkdir -p output
mkdir -p outputnew
kill `cat _server.pid` 2>/dev/null
rm _server.pid 2>/dev/null
touch _server.pid 2>/dev/null

html=outputnew/index.html
d=`date '+%s'`.`date '+%N' | cut -b -3`
clientjs="util rand userclient footer hangar net armory thing mission AI physics graphics input pewpew"
serverjs="util includeserver userserver gameserver server"
debug=0
opt=0
port=34699
mongoport=22053
host=cjmackey.webfactional.com

while getopts doh:p: o
do
		case "$o" in
				d) debug=1 ;;
				o) opt=1 ;;
				h) host="$OPTARG";;
				p) port="$OPTARG";;
		esac
done

cdn="http://$host:80/";





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
echo "var port = 80;" >> _client.js

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
echo "var mongoport = $mongoport;" >> _server.js
echo "var mongoauth = 1;" >> _server.js

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








