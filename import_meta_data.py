#!/usr/bin/python
import sys, os, subprocess

url = 'https://maybe.xcv58.me'
files = []

for i in sys.argv[1:]:
    if i.startswith('http'):
        url = i
    elif os.path.isfile(i):
        files += [i]
    pass

for i in files:
    with open(i, 'r') as content_file:
        content = content_file.read()
    subprocess.check_call("""curl %s/maybe-api-v1/metadata -d '%s'""" % (url, content), shell=True)
