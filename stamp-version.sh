#!/bin/sh
# Adds or refreshes ?v=<timestamp> on every local css/ and js/ reference in index.html,
# so browsers never mix cached old files with new ones after a deploy. Run before committing.
set -e
cd "$(dirname "$0")"
V=$(date +%Y%m%d%H%M%S)
sed -i '' -E "s#(href|src)=\"((css|js)/[^\"?]+)(\?v=[0-9]+)?\"#\1=\"\2?v=$V\"#g" index.html
echo "Stamped version $V"
