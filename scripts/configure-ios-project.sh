#!/bin/sh
set -eu

APP_NAME="${APP_NAME:-GloryPad}"
BUNDLE_ID="${BUNDLE_ID:-com.sergiocollicelli.glorypad}"
MARKETING_VERSION="${MARKETING_VERSION:-1.0}"
BUILD_NUMBER="${BUILD_NUMBER:-1}"
DEPLOYMENT_TARGET="${IOS_DEPLOYMENT_TARGET:-15.0}"

IOS_DIR="ios/App"
INFO_PLIST="$IOS_DIR/App/Info.plist"
PBXPROJ="$IOS_DIR/App.xcodeproj/project.pbxproj"
PODFILE="$IOS_DIR/Podfile"

if [ ! -d "$IOS_DIR" ]; then
  echo "Missing $IOS_DIR. Run npx cap add ios before this script."
  exit 1
fi

if [ ! -f "$INFO_PLIST" ]; then
  echo "Missing $INFO_PLIST."
  exit 1
fi

set_plist_value() {
  key="$1"
  type="$2"
  value="$3"

  if /usr/libexec/PlistBuddy -c "Set :$key $value" "$INFO_PLIST" 2>/dev/null; then
    return 0
  fi

  /usr/libexec/PlistBuddy -c "Add :$key $type $value" "$INFO_PLIST"
}

set_plist_value "CFBundleDisplayName" "string" "$APP_NAME"
set_plist_value "CFBundleName" "string" "$APP_NAME"
set_plist_value "CFBundleShortVersionString" "string" "$MARKETING_VERSION"
set_plist_value "CFBundleVersion" "string" "$BUILD_NUMBER"
set_plist_value "ITSAppUsesNonExemptEncryption" "bool" "false"

if [ -f "$PBXPROJ" ]; then
  export BUNDLE_ID MARKETING_VERSION BUILD_NUMBER DEPLOYMENT_TARGET
  ruby -0pi -e '
    gsub(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/, "PRODUCT_BUNDLE_IDENTIFIER = #{ENV["BUNDLE_ID"]};")
    gsub(/MARKETING_VERSION = [^;]+;/, "MARKETING_VERSION = #{ENV["MARKETING_VERSION"]};")
    gsub(/CURRENT_PROJECT_VERSION = [^;]+;/, "CURRENT_PROJECT_VERSION = #{ENV["BUILD_NUMBER"]};")
    gsub(/IPHONEOS_DEPLOYMENT_TARGET = [^;]+;/, "IPHONEOS_DEPLOYMENT_TARGET = #{ENV["DEPLOYMENT_TARGET"]};")
  ' "$PBXPROJ"
fi

if [ -f "$PODFILE" ]; then
  export DEPLOYMENT_TARGET
  if grep -q "^platform :ios" "$PODFILE"; then
    ruby -0pi -e 'gsub(/^platform :ios, .*/, "platform :ios, '\''#{ENV["DEPLOYMENT_TARGET"]}'\''")' "$PODFILE"
  else
    tmpfile="$PODFILE.tmp"
    printf "platform :ios, '%s'\n" "$DEPLOYMENT_TARGET" > "$tmpfile"
    cat "$PODFILE" >> "$tmpfile"
    mv "$tmpfile" "$PODFILE"
  fi
fi

echo "Configured $APP_NAME iOS metadata for $BUNDLE_ID, version $MARKETING_VERSION ($BUILD_NUMBER), iOS $DEPLOYMENT_TARGET."
