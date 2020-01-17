#!/usr/bin/env bash

dir="$(dirname $0)"

for month in "201704" "201705" "201706" "201707" "201708" "201709" "201710" "201711" "201712"
do
    echo "node ${dir}/localdatapara.js ${month}"
done
