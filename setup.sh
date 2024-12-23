#!/bin/sh

npm i
npm run build

cd dist
wget https://git.eaglercraft.rip/eaglercraft/eaglercraft-builds/raw/branch/main/EaglercraftX_1.8_WASM-GC_Web.zip
unzip EaglercraftX_1.8_WASM-GC_Web.zip
rm EaglercraftX_1.8_WASM-GC_Web.zip
sed -i 's/<head>/<head>\<script src="index.js"><\/script>/' index.html
cp ../ci/_headers .
