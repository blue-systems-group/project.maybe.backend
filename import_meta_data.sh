#!/bin/bash
url="https://maybe.xcv58.me"
# Uncomment below line if you use it in local.
# url="http://127.0.0.1:3000"

[[ $# > 0 ]] && file=${1} || file="doc/maybe_meta.json"
json=$(cat ${file} | tr -d "\n")
hash=$(echo ${json} | grep -o "sha224_hash\":\\s*\"[A-z0-9]*\"" | tr -d "\" :")
hash=${hash#sha224_hash}
json="'${json}'"
# echo "curl ${url}/maybe-api-v1/metadata/${hash} -X DELETE"
# curl ${url}/maybe-api-v1/metadata/${hash} -X DELETE
rm -f temp.sh
echo "curl ${url}/maybe-api-v1/metadata?callback=1 -d ${json}" > temp.sh
bash temp.sh
rm -f temp.sh
