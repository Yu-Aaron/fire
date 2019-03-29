#!/bin/bash
set -e

help(){
    echo "
Usage:
 $0 \
 -n|--buildnum <buildnum> \
 -s|--src <source_dir> \
 -d|--dest <dest_dir> \

Parse command options.

Options: 
    -n --buildnum <buildnum>    Build number 
    -s --src <source_dir>       Source directory
    -d --dest <dest_dir>        Destination directory.
    [-h --help]                 Display this help and exit
    "
}

[[ $# -lt 1 ]] && help && exit

ARGS=`getopt -o n:s:d:h --long buildnum:,src:,dest:,help -n $0 -- "$@"`
eval set -- "${ARGS}"
while true
do
    case "$1" in
        -n|--buildnum) 
            buildnum=$2 && shift 2;;
        -s|--src) 
            src_dir=$2 && shift 2;;
        -d|--dest)
            dest_dir=$2 && shift 2;;
        -h|--help) 
            help && exit;; 
        --)shift && break;;
        *) echo "Unrecognized arguments!" && exit 1;;
    esac
done

[[ -z "$buildnum" ]] && echo "build number is not set" && help &&exit 200
[[ -z "$src_dir" ]] && echo "src_dir is not set" && help && exit 200
[[ -z "$dest_dir" ]] && echo "dest_dir is not set" && help && exit 200

[[ ! -d $src_dir ]] && mkdir -p $src_dir
[[ ! -d $dest_dir ]] && mkdir -p $dest_dir

branch=$(git rev-parse --abbrev-ref HEAD)
echo "using branch: ${branch}, buildnum: ${buildnum}, source dir: ${src_dir}, destination dir: ${dest_dir}"

hash=$(git log -n 1 --pretty=format:%h)

repo="capstone_ui"

install_path=install.sh
setup_path=setup.sh

latest_build_link="$dest_dir/ui-$branch-latest"
latest_zipfile_link=""$latest_build_link".tar.gz"
makeself="/usr/bin/makeself --header /usr/share/makeself/makeself-header.sh"
zip_file="$repo-$buildnum-$branch-$hash.tar.gz"
_zip_file="$dest_dir/$zip_file"
setupdir="/tmp/capstone_ui_setup"
customer_name="ACORN"

[ -d /tmp/$repo ] && rm -rf /tmp/$repo
mkdir -p /tmp/$repo
[ -d $setupdir ] && rm -rf $setupdir
mkdir -p $setupdir

cd $src_dir
rm -f *.tar.gz
cd -

#compiling ui package
gulp build 
cp -r dist/* /tmp/$repo

#generating logo.json, and moving logo.json to package
python gen_ui_config.py $customer_name
mv logo.json /tmp/$repo/js


date_time=`date`

version_text(){
    cat <<EOF
$buildnum
$branch
$hash
$date_time
EOF

}

touch /tmp/$repo/version.txt
echo "$(version_text)" > /tmp/$repo/version.txt

#create package
tar -zcvf $_zip_file -C /tmp $repo
rm -rf /tmp/$repo

cp ${install_path} ${setupdir}
cp ${_zip_file} ${setupdir}

# makeself.sh [args] archive_dir file_name label startup_script [script_args]
${makeself} ${setupdir} ${setup_path} "UI" ./${install_path} $zip_file
chmod +x ${setup_path}

mv ${setup_path} ${dest_dir}

rm -rf $setupdir

