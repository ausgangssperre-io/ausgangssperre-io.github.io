#!/bin/bash

set -eu

# Ensures that headers and footers are consistent on each page.
for i in index.html pages/*/*.html; do
  cp $i /tmp/the-page.html
  sed -i '1,/CONTENT START/ d' /tmp/the-page.html
  sed -i '/CONTENT END/,$ d' /tmp/the-page.html
  cat src/partial-header.html /tmp/the-page.html src/partial-footer.html > $i
done
rm -f /tmp/the-page.html

# Customize the content for each page
for i in index.html pages/*/*.html; do
  sed -i "s/PAGE BASENAME/$(basename $i .html)/" $i
done

#
