#!/bin/bash
for i in {1..100};
do
    curl http://127.0.0.1:3000/maybe-api-v1/logs/a -d "{\"a\": \"$i\"}"
done
