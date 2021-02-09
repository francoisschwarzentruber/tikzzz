#!/usr/bin/env sh

${BROWSER:-firefox} "http://127.0.0.1:8123/"
echo "Opening http://127.0.0.1:8123/"
php -S 127.0.0.1:8123
