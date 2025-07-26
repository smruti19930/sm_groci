#!/usr/bin/env bash

# exit on error
set -o errexit

npm install
npm run build

# run database migrations
npm run migrate
