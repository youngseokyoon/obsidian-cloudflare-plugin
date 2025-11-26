#!/bin/bash
# Release automation script for Obsidian plugin

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Obsidian Plugin Release Script${NC}"
echo ""

# Check if version argument is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Version number required${NC}"
    echo "Usage: ./scripts/release.sh <version>"
    echo "Example: ./scripts/release.sh 1.0.2"
    exit 1
fi

VERSION=$1

echo -e "${YELLOW}📋 Release version: $VERSION${NC}"
echo ""

# Step 1: Update manifest.json
echo -e "${YELLOW}1️⃣  Updating manifest.json...${NC}"
sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" manifest.json
echo -e "${GREEN}✓ manifest.json updated${NC}"

# Step 1.5: Update package.json
echo -e "${YELLOW}1️⃣.5️⃣  Updating package.json...${NC}"
sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
echo -e "${GREEN}✓ package.json updated${NC}"

# Step 2: Update versions.json
echo -e "${YELLOW}2️⃣  Updating versions.json...${NC}"
MIN_APP_VERSION=$(grep -o '"minAppVersion": "[^"]*"' manifest.json | cut -d'"' -f4)

# Read existing versions.json
VERSIONS_CONTENT=$(cat versions.json)

# Add new version entry (before the last closing brace)
NEW_ENTRY="  \"$VERSION\": \"$MIN_APP_VERSION\""

# Check if this is the first entry
if grep -q "^{" versions.json && grep -q "^}$" versions.json && [ $(wc -l < versions.json) -eq 2 ]; then
    # Empty versions.json
    echo "{\n  \"$VERSION\": \"$MIN_APP_VERSION\"\n}" > versions.json
else
    # Add comma to last entry and append new entry
    sed -i '' '$d' versions.json  # Remove last }
    sed -i '' '$ s/$/,/' versions.json  # Add comma to last line
    echo "$NEW_ENTRY" >> versions.json
    echo "}" >> versions.json
fi

echo -e "${GREEN}✓ versions.json updated${NC}"

# Step 3: Build
echo -e "${YELLOW}3️⃣  Building plugin...${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"

# Step 4: Run lint (abort on errors)
echo -e "${YELLOW}4️⃣  Running lint...${NC}"
npm run lint
# If lint fails, the script will exit because of set -e
echo -e "${GREEN}✓ Lint passed${NC}"

# Step 5: Git commit
echo -e "${YELLOW}5️⃣  Creating git commit...${NC}"
git add manifest.json versions.json package.json
git commit -m "Release v$VERSION

Signed-off-by: youngseok.yoon <earwigz32@gmail.com>"
echo -e "${GREEN}✓ Commit created${NC}"

# Step 6: Create and push tag
echo -e "${YELLOW}6️⃣  Creating and pushing tag...${NC}"
echo -e "Dry run needed, run the following commands:\n"

echo "git tag $VERSION"
echo "git push origin master"
echo "git push origin $VERSION"

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Check GitHub Actions: https://github.com/youngseokyoon/obsidian-cloudflare-plugin/actions"
echo "2. Verify Release: https://github.com/youngseokyoon/obsidian-cloudflare-plugin/releases"
echo "3. If this is a new plugin, submit to community plugins"
echo ""
