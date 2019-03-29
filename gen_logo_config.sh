#!/bin/bash
branch=`./branch.sh`
echo "using branch: "$branch
ACORN_PATH="/storage/cornerstone/ui/config/"$branch"/logo/ACORN"
SIPAI_PATH="/storage/cornerstone/ui/config/"$branch"/logo/SIPAI"

#generate paths
mkdir -p $ACORN_PATH
mkdir -p $SIPAI_PATH

# generate ACORN logo
python gen_ui_config.py ACORN
echo $ACORN_PATH
cp logo.json $ACORN_PATH

# generate SIPAI logo
python gen_ui_config.py SIPAI
echo $SIPAI_PATH
cp logo.json $SIPAI_PATH
