#!/bin/bash
# Submit plugin to Obsidian community plugins

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}📦 Obsidian Community Plugin Submission Script${NC}"
echo ""

# Configuration
PLUGIN_ID="cloudflare-image-auto-uploader"
PLUGIN_NAME="Cloudflare Image Auto Uploader"
PLUGIN_AUTHOR="youngseok.yoon"
PLUGIN_DESCRIPTION="Upload images to Cloudflare Image with automatic paste, smart sizing, and local fallback."
PLUGIN_REPO="youngseokyoon/obsidian-cloudflare-plugin"
OBSIDIAN_RELEASES_REPO="obsidianmd/obsidian-releases"
FORK_REPO="youngseokyoon/obsidian-releases"

# Check if obsidian-releases directory exists
RELEASES_DIR="../obsidian-releases"

if [ ! -d "$RELEASES_DIR" ]; then
    echo -e "${YELLOW}📥 Cloning obsidian-releases fork...${NC}"
    cd ..
    git clone "git@github.com:$FORK_REPO.git"
    cd obsidian-cloudflare-plugin
    echo -e "${GREEN}✓ Fork cloned${NC}"
else
    echo -e "${YELLOW}📥 Updating obsidian-releases fork...${NC}"
    cd "$RELEASES_DIR"
    git checkout master
    git pull origin master
    cd ../obsidian-cloudflare-plugin
    echo -e "${GREEN}✓ Fork updated${NC}"
fi

# Create plugin entry JSON
PLUGIN_ENTRY=$(cat <<EOF
  {
    "id": "$PLUGIN_ID",
    "name": "$PLUGIN_NAME",
    "author": "$PLUGIN_AUTHOR",
    "description": "$PLUGIN_DESCRIPTION",
    "repo": "$PLUGIN_REPO"
  }
EOF
)

echo ""
echo -e "${YELLOW}📝 Plugin entry to add:${NC}"
echo "$PLUGIN_ENTRY"
echo ""

echo -e "${BLUE}ℹ️  Manual steps required:${NC}"
echo "1. Open: $RELEASES_DIR/community-plugins.json"
echo "2. Find the correct alphabetical position (after 'cm-typewriter-scroll-obsidian')"
echo "3. Add the plugin entry shown above"
echo "4. Save the file"
echo ""
echo -e "${YELLOW}Press Enter when ready to commit and push...${NC}"
read

# Commit and push
cd "$RELEASES_DIR"

if git diff --quiet community-plugins.json; then
    echo -e "${RED}❌ No changes detected in community-plugins.json${NC}"
    echo "Please add the plugin entry manually and run this script again."
    exit 1
fi

echo -e "${YELLOW}💾 Committing changes...${NC}"
git add community-plugins.json
git commit -m "Add $PLUGIN_NAME plugin"
git push origin master

echo -e "${GREEN}✓ Changes pushed to fork${NC}"
echo ""
echo -e "${GREEN}🎉 Ready to create Pull Request!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Visit: https://github.com/$FORK_REPO"
echo "2. Click 'Contribute' → 'Open pull request'"
echo "3. Use this PR template:"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cat <<'PRTEMPLATE'
## Plugin Information

- **Plugin Name:** Cloudflare R2 Image Upload
- **Author:** youngseok.yoon
- **Repository:** https://github.com/youngseokyoon/obsidian-cloudflare-plugin
- **Initial Release:** v1.0.1
- **License:** MIT

## Description

Upload images to Cloudflare R2 instead of storing them locally. Features automatic upload on paste, smart image sizing, local fallback, and folder organization.

## Key Features

- 🚀 Auto-upload to Cloudflare R2
- 🎨 Smart sizing (Fixed/Percentage/Auto)
- 💾 Local fallback
- 📁 Folder organization
- 🔧 Custom domain support

## Documentation

- [English README](https://github.com/youngseokyoon/obsidian-cloudflare-plugin/blob/master/README.md)
- [Korean README](https://github.com/youngseokyoon/obsidian-cloudflare-plugin/blob/master/README.ko.md)

## Checklist

- [x] Read plugin guidelines
- [x] Comprehensive README
- [x] Release with required files
- [x] Follows guidelines
- [x] Tested on latest Obsidian
- [x] MIT licensed
- [x] Alphabetically ordered
PRTEMPLATE
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
