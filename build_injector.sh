#!/bin/sh

BASE64BUNDLE="return atob('$(base64 dist/index.js)')"
echo -n $BASE64BUNDLE > bundle.b64
sed -e "/WISPCRAFTSRCBUNDLE/r bundle.b64" -e "/WISPCRAFTSRCBUNDLE/d" "index.html" > dist/injector.html
rm bundle.b64
echo "Injector Build Complete!"