#!/bin/bash

mkdir -p ./images/blurred

find images -maxdepth 1 -type f | \
    sed -E -e 's@(^images/)(.*$)@\0 \1blurred/\2@g' | \
    xargs --verbose -P 0 -L 1 convert -gaussian-blur 75x25 -brightness-contrast -10
