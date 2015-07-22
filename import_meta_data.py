#!/usr/bin/python
import sys, os, subprocess

url = 'https://maybe.xcv58.me'
file = 'doc/maybe_meta.json'
files = []

for i in sys.argv[1:]:
    if i.startswith('http'):
        url = i
    elif os.path.isfile(i):
        files += [i]
    pass

if not os.path.isfile(file):
    print file, 'is not a file!'
    quit()

if len(files) == 0:
    files += file
for i in files:
    with open(i, 'r') as content_file:
        content = content_file.read()
    subprocess.check_call("""curl %s/maybe-api-v1/metadata -d '%s'""" % (url, content), shell=True)
