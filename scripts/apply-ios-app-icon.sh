#!/bin/sh
set -eu

SOURCE="assets/branding/AppIcon-1024.png"
ICONSET="ios/App/App/Assets.xcassets/AppIcon.appiconset"

if [ ! -f "$SOURCE" ]; then
  echo "Missing $SOURCE."
  echo "Add a 1024x1024 PNG with no transparency before running the App Store build."
  exit 1
fi

WIDTH="$(sips -g pixelWidth "$SOURCE" 2>/dev/null | awk '/pixelWidth/ {print $2}')"
HEIGHT="$(sips -g pixelHeight "$SOURCE" 2>/dev/null | awk '/pixelHeight/ {print $2}')"
ALPHA="$(sips -g hasAlpha "$SOURCE" 2>/dev/null | awk '/hasAlpha/ {print $2}')"

if [ "$WIDTH" != "1024" ] || [ "$HEIGHT" != "1024" ]; then
  echo "$SOURCE must be exactly 1024x1024 pixels. Current size: ${WIDTH}x${HEIGHT}."
  exit 1
fi

if [ "$ALPHA" = "yes" ] || [ "$ALPHA" = "true" ]; then
  echo "$SOURCE must not contain transparency/alpha."
  exit 1
fi

rm -rf "$ICONSET"
mkdir -p "$ICONSET"

make_icon() {
  size="$1"
  filename="$2"
  sips -z "$size" "$size" "$SOURCE" --out "$ICONSET/$filename" >/dev/null
}

make_icon 40 "Icon-20@2x.png"
make_icon 60 "Icon-20@3x.png"
make_icon 58 "Icon-29@2x.png"
make_icon 87 "Icon-29@3x.png"
make_icon 80 "Icon-40@2x.png"
make_icon 120 "Icon-40@3x.png"
make_icon 120 "Icon-60@2x.png"
make_icon 180 "Icon-60@3x.png"
make_icon 20 "Icon-20-ipad.png"
make_icon 40 "Icon-20-ipad@2x.png"
make_icon 29 "Icon-29-ipad.png"
make_icon 58 "Icon-29-ipad@2x.png"
make_icon 40 "Icon-40-ipad.png"
make_icon 80 "Icon-40-ipad@2x.png"
make_icon 76 "Icon-76-ipad.png"
make_icon 152 "Icon-76-ipad@2x.png"
make_icon 167 "Icon-83.5-ipad@2x.png"
cp "$SOURCE" "$ICONSET/Icon-1024.png"

cat > "$ICONSET/Contents.json" <<'JSON'
{
  "images": [
    { "idiom": "iphone", "size": "20x20", "scale": "2x", "filename": "Icon-20@2x.png" },
    { "idiom": "iphone", "size": "20x20", "scale": "3x", "filename": "Icon-20@3x.png" },
    { "idiom": "iphone", "size": "29x29", "scale": "2x", "filename": "Icon-29@2x.png" },
    { "idiom": "iphone", "size": "29x29", "scale": "3x", "filename": "Icon-29@3x.png" },
    { "idiom": "iphone", "size": "40x40", "scale": "2x", "filename": "Icon-40@2x.png" },
    { "idiom": "iphone", "size": "40x40", "scale": "3x", "filename": "Icon-40@3x.png" },
    { "idiom": "iphone", "size": "60x60", "scale": "2x", "filename": "Icon-60@2x.png" },
    { "idiom": "iphone", "size": "60x60", "scale": "3x", "filename": "Icon-60@3x.png" },
    { "idiom": "ipad", "size": "20x20", "scale": "1x", "filename": "Icon-20-ipad.png" },
    { "idiom": "ipad", "size": "20x20", "scale": "2x", "filename": "Icon-20-ipad@2x.png" },
    { "idiom": "ipad", "size": "29x29", "scale": "1x", "filename": "Icon-29-ipad.png" },
    { "idiom": "ipad", "size": "29x29", "scale": "2x", "filename": "Icon-29-ipad@2x.png" },
    { "idiom": "ipad", "size": "40x40", "scale": "1x", "filename": "Icon-40-ipad.png" },
    { "idiom": "ipad", "size": "40x40", "scale": "2x", "filename": "Icon-40-ipad@2x.png" },
    { "idiom": "ipad", "size": "76x76", "scale": "1x", "filename": "Icon-76-ipad.png" },
    { "idiom": "ipad", "size": "76x76", "scale": "2x", "filename": "Icon-76-ipad@2x.png" },
    { "idiom": "ipad", "size": "83.5x83.5", "scale": "2x", "filename": "Icon-83.5-ipad@2x.png" },
    { "idiom": "ios-marketing", "size": "1024x1024", "scale": "1x", "filename": "Icon-1024.png" }
  ],
  "info": {
    "author": "xcode",
    "version": 1
  }
}
JSON

echo "Applied iOS App Icon from $SOURCE."
