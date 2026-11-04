#!/usr/bin/env bash

set -euo pipefail

# Read the version and buildNumber from package.json
VERSION=$(jq -r .version package.json)
BUILD_NUMBER=$(jq -r .buildVersion package.json)

# Keep variant sources in sync so applying a variant preserves the release version.
for PLIST_FILE in ios/NekokoLPA/Info.plist variants/*/ios/Info.plist; do
    [ -f "$PLIST_FILE" ] || continue
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" "$PLIST_FILE"
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" "$PLIST_FILE"
done

sed -i '' \
    -e "s/CURRENT_PROJECT_VERSION = [^;]*;/CURRENT_PROJECT_VERSION = $BUILD_NUMBER;/g" \
    -e "s/MARKETING_VERSION = [^;]*;/MARKETING_VERSION = $VERSION;/g" \
    ios/NekokoLPA.xcodeproj/project.pbxproj

echo "Updated Info.plist with version $VERSION and build number $BUILD_NUMBER"
