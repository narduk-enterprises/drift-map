#!/usr/bin/env sh

set -eu

mode="${1:---local}"

for file in drizzle/*.sql; do
  if [ ! -f "$file" ]; then
    continue
  fi

  echo "Applying $file with mode $mode"
  wrangler d1 execute drift-map-db "$mode" --file="$file"
done
