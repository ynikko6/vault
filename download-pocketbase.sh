#!/bin/bash

# PocketBase Download Script for macOS/Linux
# This script automatically downloads and extracts PocketBase

VERSION="0.23.6"
OS=$(uname -s)
ARCH=$(uname -m)

echo "🚀 Downloading PocketBase v${VERSION}..."

# Determine the correct download URL based on OS and architecture
if [ "$OS" = "Darwin" ]; then
    if [ "$ARCH" = "arm64" ]; then
        URL="https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_darwin_arm64.zip"
        echo "Detected: macOS ARM64 (Apple Silicon)"
    else
        URL="https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_darwin_amd64.zip"
        echo "Detected: macOS AMD64 (Intel)"
    fi
elif [ "$OS" = "Linux" ]; then
    URL="https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_linux_amd64.zip"
    echo "Detected: Linux AMD64"
else
    echo "❌ Unsupported OS: $OS"
    echo "Please download PocketBase manually from https://pocketbase.io/docs/"
    exit 1
fi

# Download PocketBase
echo "📥 Downloading from: $URL"
curl -L "$URL" -o pocketbase.zip

if [ $? -ne 0 ]; then
    echo "❌ Download failed!"
    exit 1
fi

# Extract
echo "📦 Extracting..."
unzip -o pocketbase.zip

# Cleanup
rm pocketbase.zip

# Make executable
chmod +x pocketbase

echo "✅ PocketBase downloaded successfully!"
echo ""
echo "Next steps:"
echo "1. Run: ./pocketbase serve"
echo "2. Open http://127.0.0.1:8090/_/ to set up admin account"
echo "3. Follow the instructions in POCKETBASE_SETUP.md"
