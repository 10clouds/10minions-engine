#!/usr/bin/env bash

NEW_VERSION="${1//v}"
CURRENT_VERSION="$(jq -r '.version' package.json)"

sed -i "s/$CURRENT_VERSION/$NEW_VERSION/g" package.json
