#!/bin/bash
echo "does not work yet"
exit

function exchangeHeaderAndFooter() {
    echo "$filename"
    sed -i -e '1 e cat src/partial-header.html' "filename"
    sed -i -e '\$a e cat src/partial-footer.html' "filename"

}

for filename in *.html; do
    exchangeHeaderAndFooter
done

for filename in pages/de/*.html; do
    exchangeHeaderAndFooter
done