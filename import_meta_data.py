#!/usr/bin/python
import sys, os, subprocess

url = 'https://maybe.xcv58.me'
file = 'doc/maybe_meta.json'

for i in sys.argv[1:]:
    if i.startswith('http'):
        url = i
    elif os.path.isfile(i):
        file = i
    pass

if not os.path.isfile(file):
    print file, 'is not a file!'
    quit()

with open(file, 'r') as content_file:
    content = content_file.read()

subprocess.check_call("""curl %s/maybe-api-v1/metadata -d '%s'""" % (url, content), shell=True)
