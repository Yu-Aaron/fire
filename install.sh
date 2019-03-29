#!/bin/bash

set -e

if [[ -$EUID -ne 0 ]]; then
    echo "You must be the root to do this." 1>&2
    exit 100
fi

basedir=$(dirname $0)

filename=$1

if [ -z $filename ]; then
    echo "filename must be specified." 1>&2
    exit 200
fi

install_only=false
upgrade_only=false
install_and_restart=false

if [ $2 == "--install-only" ]; then
    install_only=true
elif [ $2 == "--upgrade-only" ]; then
    upgrade_only=true
else
    install_and_restart=true
fi

echo "install_only:${install_only}   upgrade_only:${upgrade_only}"

echo $filename

export install_dir="/usr/share/nginx/html/"

if [ ! -d $install_dir ]; then
	mkdir -p $install_dir
fi
chmod -R ag+rx /usr/share/nginx

if [ -d $install_dir/capstone_ui ]; then
    rm -rf $install_dir/capstone_ui
fi

tar xvf ${filename} -C $install_dir
chown -R root:root $install_dir/capstone_ui

$install_and_restart && /etc/init.d/nginx restart

true
