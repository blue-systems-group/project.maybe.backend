Get all of the player records:
```
curl http://127.0.0.1:3000/maybe-api-v1/devices
```

Get an individual record:
```
curl http://127.0.0.1:3000/maybe-api-v1/devices/XXX
```

Create a record:
```
curl http://127.0.0.1:3000/maybe-api-v1/devices -d "{\"deviceid\": \"001\", \"values\" : {\"button1\":true, \"button2\":true, \"button3\":true, \"button4\":true}}"
curl -d "{\"name\": \"John Smith\"}" http://127.0.0.1:3000/maybe-api-v1/devices
```

Update a record:
```
curl -X PUT -d "{\"\$set\":{\"values.button1\" : false}}" http://127.0.0.1:3000/maybe-api-v1/devices/XXX
```

Delete a record:
```
curl -X DELETE http://127.0.0.1:3000/maybe-api-v1/devices/XXX
```

----------------------------------------------------------------
Get all of the player records:
```
$ curl -H "X-Auth-Token: 97f0ad9e24ca5e0408a269748d7fe0a0" http://127.0.0.1:3000/maybe-api-v1/devices
```

Get an individual record:
```
$ curl -H "X-Auth-Token: 97f0ad9e24ca5e0408a269748d7fe0a0" http://127.0.0.1:3000/maybe-api-v1/devices/c4acddd1-a504-4212-9534-adca17af4885
```

Create a record:
```
$ curl -H "X-Auth-Token: 97f0ad9e24ca5e0408a269748d7fe0a0" -d "{\"name\": \"John Smith\"}" http://127.0.0.1:3000/maybe-api-v1/devices
```

Update a record:
```
$ curl -H "X-Auth-Token: 97f0ad9e24ca5e0408a269748d7fe0a0" -X PUT -d "{\"\$set\":{\"gender\":\"male\"}}" http://127.0.0.1:3000/maybe-api-v1/devices/c4acddd1-a504-4212-9534-adca17af4885
```

Delete a record:
```
$ curl -H "X-Auth-Token: 97f0ad9e24ca5e0408a269748d7fe0a0" -X DELETE http://127.0.0.1:3000/maybe-api-v1/devices/c4acddd1-a504-4212-9534-adca17af4885
```

----------------------------------------------------------------
