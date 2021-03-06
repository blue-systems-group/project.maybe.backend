#!/usr/bin/python
import sys, os, subprocess

def isInt(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

url = 'https://maybe.xcv58.me'
n = 10
delete = False

for i in sys.argv[1:]:
    if i.startswith('http'):
        url = i
    elif isInt(i):
        n = int(i)
    elif i == '-d':
        delete = True
    pass

for i in range(1, n + 1):
    if delete:
        subprocess.check_call("""curl -X DELETE %s/maybe-api-v1/devices/%03d""" % (url, i), shell=True)
    else:
        subprocess.check_call("""curl %s/maybe-api-v1/devices -d '{"deviceid": "%03d"}'""" % (url, i), shell=True)
