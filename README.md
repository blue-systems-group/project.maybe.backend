# Maybe backend
[![Build Status](https://travis-ci.org/xcv58/backend.svg?branch=meteor)](https://travis-ci.org/xcv58/backend)
[![Code Climate](https://codeclimate.com/github/xcv58/backend/badges/gpa.svg)](https://codeclimate.com/github/xcv58/backend)

This project is backend for [maybe](http://blue.cse.buffalo.edu/projects/maybe/) project of [blue](http://blue.cse.buffalo.edu) in [University at Buffalo](http://www.cse.buffalo.edu).

Table of Contents
=================

  * [Maybe backend](#maybe-backend)
  * [Table of Contents](#table-of-contents)
  * [Usage](#usage)
    * [Convert README.md to Meteor template](#convert-readmemd-to-meteor-template)
  * [RESTFul APIs](#restful-apis)
    * [devices](#devices)
      * [POST](#post)
      * [GET](#get)
      * [PUT](#put)
      * [DELETE](#delete)
    * [metadata](#metadata)
      * [POST](#post-1)
      * [GET](#get-1)
      * [PUT](#put-1)
      * [DELETE](#delete-1)
    * [logs](#logs)
      * [POST](#post-2)
      * [GET](#get-2)
      * [PUT](#put-2)
      * [DELETE](#delete-2)

Created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc)

---

# Usage

Just run this command in your terminal:
```bash
   git clone git@github.com:xcv58/backend.git maybeBackend
   cd maybeBackend
   bash setup.sh
```
It will automatically download meteor then run it.
If you just need run it.
You can use command:
```bash
   cd app
   meteor
```

## Convert readme file to Meteor template
```bash
   generate-md --layout ./meteor-template-layout --input ./README.md --output ./app/client
```

---

# RESTFul APIs
This backend server provides three categories of APIs.

## devices
The devices API is designed for store choices of every deive, so we use ```deviceid``` as key. Every device should only have one entry inside the colection.

### POST
Create a new record for specific ```deviceid```.

    $ curl http://localhost:3000/maybe-api-v1/devices -d '{"deviceid": "001"}'

If everything good, it will return a JSONObject with status code ```201``` like this:
```json
[
  {
    "choices": {
      "1aab3f28f3d0ead580c3c22b10fee7e81c75e6d1e8f957611aedf51e": {
        "labels": [
          {
            "choice": 0,
            "label": "simple test"
          },
          {
            "choice": 0,
            "label": "another test"
          },
          {
            "choice": 0,
            "label": "block test"
          },
          {
            "choice": 0,
            "label": "third block test"
          },
          {
            "choice": 0,
            "label": "another block test"
          }
        ],
        "name": "testing_inputs.maybe"
      }
    },
    "queryCount": 1,
    "deviceid": "001"
  }
]
```

If the ```deviceid``` is duplicated, its status code ```500```, content like this:

    { "error": "MongoError: E11000 duplicate key error index: meteor.devices.$_id_  dup key: { : \"001\" }" }

If something wrong, its status code ```409```, content like this:

    { "message": "Could not post that object." }

### GET
Get all of the devices:

    $ curl http://localhost:3000/maybe-api-v1/devices

Get a device record:

    $ curl http://localhost:3000/maybe-api-v1/devices/001

If sucess, it will return an array of JSONObjects.

### PUT
Update a deivce:

    $ curl http://localhost:3000/maybe-api-v1/devices/001 -X PUT -d '{"$set": {"a" : "c"}}'

If sucess, it will return a JSONObjects.

    $ curl http://localhost:3000/maybe-api-v1/devices/001?callback=0 -X PUT -d '{"$set": {"a" : "c"}}'

With ```?callback=0```, it will return a JSONObjects to indicate the PUT's status:

    {"status":"success"}

### DELETE
Delete a record:

    $ curl http://localhost:3000/maybe-api-v1/devices/001 -X DELETE
If sucess, it will return empty content with  status code ```200```. Otherwise, the output looks like:

    {"message":"Could not delete that object."}

## metadata
The metadata need special schema, it should contains at least ```sha224_hash``` with a string, ```pacakge``` with a string, and ```statements``` with a JSONArray.

The elements in ```statements``` should have
1. ```content``` with Java code snippet (string),
2. ```line``` with a number to indicate start number in source code,
3. ```type``` and ```label``` with string separately,
4. ```alternatives``` with a JSONArray, each element should contains ```start```, ```end```, ```value``` with a number separately.

You can check from [metadata JSONObject ](https://github.com/xcv58/backend/blob/meteor/doc/maybe_meta.json) or below example:

```json
{
    "sha224_hash": "1aab3f28f3d0ead580c3c22b10fee7e81c75e6d1e8f957611aedf51e",
    "package": "testing_inputs.maybe",
    "statements": [
        {
            "content": "int i = maybe(\"simple test\") 1, 2;",
            "alternatives": [
                {
                    "start": 29,
                    "end": 30,
                    "value": 0
                },
                {
                    "start": 32,
                    "end": 33,
                    "value": 1
                }
            ],
            "line": 5,
            "type": "assignment",
            "label": "simple test"
        },
        {
            "content": "public String test = maybe(\"another test\") \"one\",\"two\",   \"three\";",
            "alternatives": [
                {
                    "start": 43,
                    "end": 48,
                    "value": 0
                },
                {
                    "start": 49,
                    "end": 54,
                    "value": 1
                },
                {
                    "start": 58,
                    "end": 65,
                    "value": 2
                }
            ],
            "line": 6,
            "type": "assignment",
            "label": "another test"
        },
        {
            "content": "maybe (\"block test\") {\n  if (\"true\") {\n    i = 0;\n  } else {\n    j = 0;\n    maybe (\"third block test\") {\n      i = 1;\n    } or {\n      j = 2;\n    } or {\n      j = 3;\n    }\n  }\n} or {\n  i = 1;\n} or {\n  j = 2;\n  maybe (\"another block test\") {\n    j = 3;\n  }\n}",
            "alternatives": [
                {
                    "start": 22,
                    "end": 177,
                    "value": 0
                },
                {
                    "start": 182,
                    "end": 193,
                    "value": 1
                },
                {
                    "start": 198,
                    "end": 257,
                    "value": 2
                }
            ],
            "line": 20,
            "type": "block",
            "label": "block test"
        },
        {
            "content": "    maybe (\"third block test\") {\n      i = 1;\n    } or {\n      j = 2;\n    } or {\n      j = 3;\n    }",
            "alternatives": [
                {
                    "start": 32,
                    "end": 51,
                    "value": 0
                },
                {
                    "start": 56,
                    "end": 75,
                    "value": 1
                },
                {
                    "start": 80,
                    "end": 99,
                    "value": 2
                }
            ],
            "line": 25,
            "type": "block",
            "label": "third block test"
        },
        {
            "content": "  maybe (\"another block test\") {\n    j = 3;\n  }",
            "alternatives": [
                {
                    "start": 32,
                    "end": 47,
                    "value": 0
                }
            ],
            "line": 37,
            "type": "block",
            "label": "another block test"
        }
    ]
}
```

### POST
Create a new record for specific ```metadata```.

    $ curl http://localhost:3000/maybe-api-v1/metadata -d 'you json object'

It will use ```sha224_hash``` as ```_id``` in MongoDB:
If everything good, it will return a JSONObject with status code ```201```.

If the ```sha224_hash``` is duplicated, its status code ```500```, content like this:

    {"error":"MongoError: E11000 duplicate key error index: meteor.metadata.$_id_  dup key: { : \"1aab3f28f3d0ead580c3c22b10fee7e81c75e6d1e8f957611aedf51e\" }"}%

If something wrong, its status code ```409```, content like this:

    { "message": "Could not post that object." }

### GET
Get all of the metadata records:

    $ curl http://localhost:3000/maybe-api-v1/metadata

Get a device record:

    $ curl http://localhost:3000/maybe-api-v1/metadata/1aab3f28f3d0ead580c3c22b10fee7e81c75e6d1e8f957611aedf51e

If sucess, it will return an array of JSONObjects.

### PUT

TODO: example doesn't fit for metadata.

Update a metadata:

    $ curl http://localhost:3000/maybe-api-v1/metadata/1aab3f28f3d0ead580c3c22b10fee7e81c75e6d1e8f957611aedf51e -X PUT -d '{"$set": {"a" : "c"}}'

If sucess, it will return a JSONObjects.

    $ curl http://localhost:3000/maybe-api-v1/metadata/1aab3f28f3d0ead580c3c22b10fee7e81c75e6d1e8f957611aedf51e?callback=0 -X PUT -d '{"$set": {"a" : "c"}}'

With ```?callback=0```, it will return a JSONObjects to indicate the PUT's status:

    {"status":"success"}

### DELETE
Delete a record:

    $ curl http://localhost:3000/maybe-api-v1/metadata/1aab3f28f3d0ead580c3c22b10fee7e81c75e6d1e8f957611aedf51e -X DELETE

If sucess, it will return empty content with  status code ```200```. Otherwise, the output looks like:

    {"message":"Could not delete that object."}%

## logs
The logs api will let you store logs from devices. So each record represents a log entry. Currently, you are only allowed to use POST method.

### POST
This is the only thing you can do with the ```logs``` api.

    $ curl http://localhost:3000/maybe-api-v1/logs/deviceid -d '{"a" : 1, "sha224_hash" : "1aab3f28f3d0ead580c3c22b10fee7e81c75e6d1e8f957611aedf51e", "label": "simple test"}'

Note that, the JSONObject must have keys ```sha224_hash``` and ```label``` to represent its ```package hash``` and ```label``` respectively!
Otherwise, the server will not allow the POST operation.

If everything good (I hope that),  it will return a JSONObject with status code ```201```:

    [{"a":1,"_metadata":{"deviceid":"deviceid","timestamp":1425851460385},"_id":"CBZNtSBgHf3MBprnX"}]

You should pass your real ```deviceid``` instead of the ```deviceid``` in url above. The data content can be arbitrary JSONObject, but you can not use the key: **```_metadata```**, it's reversed for log analysis.

### GET
You shouldn't GET log(s), because the log analysis is processing offline.

### PUT
You shouldn't PUT (change) log, because the log is unchangeable.

### DELETE
You shouldn't DELETE log(s), we'll archive logs offline.
