#!/bin/sh
gnome-terminal --tab -e "/bin/bash -c 'protractor pconf.js --suite general; exec /bin/bash -i'"
gnome-terminal --tab -e "/bin/bash -c 'protractor pconf.js --suite systemuser; exec /bin/bash -i'"