#!/bin/bash
buildnum=$1
customer_name=$2

branch=$(git rev-parse --abbrev-ref HEAD)
echo "using branch: "$branch

dirname="cornerstone_ui"

download_path="/storage/cornerstone/ui/"
latest_link="/storage/cornerstone/ui/ui-"$branch"-latest"
ext=".tar.gz"

rm *.tar.gz
rm -r $dirname
rm $latest_link$ext

#compiling ui package
gulp compile
mv www $dirname

#generating logo.json, and moving logo.json to package
#python gen_ui_config.py $customer_name
#cp logo.json $dirname/js

touch $dirname/version.txt
echo $buildnum > $dirname/version.txt

#create package
tar -zcvf $dirname"-"$branch"-"$buildnum$ext $dirname

cp $dirname"-"$branch"-"$buildnum$ext $download_path
ln -s $download_path$dirname"-"$branch"-"$buildnum$ext $latest_link$ext
