#!/bin/bash

# Exit if any command fails
set -e

# Xcode Cloud clones the repository and then runs this script from the ci_scripts directory.
# The current working directory is ios/ci_scripts.
# We need to go to the project root.
cd ../..

# 1. Install Node.js and Yarn
# Xcode Cloud environment might not have Node.js in the PATH by default.
# Homebrew is pre-installed on Xcode Cloud.
if ! command -v node &> /dev/null || ! node -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  process.exit((major === 22 && minor >= 13) || (major === 24 && minor >= 3) || major >= 26 ? 0 : 1);
'; then
    echo "Installing a Node.js version supported by React Native 0.88..."
    brew install node@24
    brew link --overwrite node@24
fi

if ! command -v yarn &> /dev/null; then
    echo "Yarn not found, installing via Homebrew..."
    brew install yarn
fi

# Ensure yarn is in path for the rest of the script
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

yarn install

# 2. Apply the default variant 'store'
# This ensures project.pbxproj, Info.plist, etc. are correctly configured
# even if they weren't fully committed in the right state.
chmod +x apply_variant.sh
./apply_variant.sh store

# 3. Install CocoaPods
# Xcode Cloud has CocoaPods pre-installed.
cd ios
pod install
