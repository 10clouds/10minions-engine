#!/usr/bin/env bash

# Get the new version without 'v'
NEW_VERSION="${1//v}"
jq ".version = \"$NEW_VERSION\"" package.json > package.json.tmp

mv package.json.tmp package.json