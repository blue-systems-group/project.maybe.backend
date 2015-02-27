#!/bin/bash

# First set up virtualenv
# Does the system have virtualenv?
HAS_VIRTUALENV="1"
type virtualenv >/dev/null 2>&1 || { echo >&2 "virtualenv is not installed!"; HAS_VIRTUALENV="0";}
if [ ! -d ".env" ]; then
	if [[ $HAS_VIRTUALENV -ne 0 ]]; then
		virtualenv .env
		echo "export VIRTUAL_ENV_BASE=\$VIRTUAL_ENV/.." >>.env/bin/activate
		# Create bin directory
		if [ ! -d "bin" ]; then
			mkdir -p bin
			# Add bin to PATH
			echo "export PATH=\$VIRTUAL_ENV_BASE/bin:\$PATH" >>.env/bin/activate
		fi

		source .env/bin/activate
	fi
fi


# Install meteor
if [ ! -d "meteor" ]; then
	git clone https://github.com/meteor/meteor.git
	git checkout release/METEOR@1.0.3.2
	if [[ $HAS_VIRTUALENV -ne 0 ]]; then
		ln -s `pwd`/meteor/meteor `pwd`/bin
	fi
	export PATH=`pwd`/meteor:$PATH
	cd app && meteor && cd - 2>&1
fi

# Set up app dependencies
cd app
	../meteor/meteor add mrt:collection-api
cd - >/dev/null
