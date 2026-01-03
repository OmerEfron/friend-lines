#!/bin/bash

# Run the cleanup script using backend's node_modules
cd "$(dirname "$0")/../backend" && node ../scripts/clean-tables.js

