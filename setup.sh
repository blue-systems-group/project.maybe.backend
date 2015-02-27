#!/bin/bash

# First set up virtualenv
# Does the system have virtualenv?
type virtualenv >/dev/null 2>&1 || { echo >&2 "virtualenv is not installed!"; exit 1;}
if [ ! -d ".env" ]; then
	virtualenv .env
	echo "export VIRTUAL_ENV_BASE=\$VIRTUAL_ENV/.." >>.env/bin/activate
fi

# Create bin directory
if [ ! -d "bin" ]; then
	mkdir -p bin
	# Add bin to PATH
	echo "export PATH=\$PATH:\$VIRTUAL_ENV_BASE/bin" >>.env/bin/activate
fi

source .env/bin/activate

# Install meteor
if [ ! -d "meteor" ]; then
	git clone https://github.com/meteor/meteor.git
	cd bin && ln -s ../meteor/meteor ./ && cd - >/dev/null 2>&1
	meteor
fi

# Set up server dependencies
meteor add mrt:collection-api
