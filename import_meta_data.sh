url="http://127.0.0.1:3000"
# url="https://maybe.xcv58.me"
json=$(cat doc/maybe_meta.json | tr -d "\n")
json="'${json}'"
rm -f temp.sh
echo "curl ${url}/maybe-api-v1/metadata -d ${json}" > temp.sh
bash temp.sh
rm -f temp.sh
