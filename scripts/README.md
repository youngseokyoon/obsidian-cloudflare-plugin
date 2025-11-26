# Release Scripts

This directory contains automation scripts for the Obsidian plugin release process.

## Scripts

### 1. `release.sh` - Automated Release

Automates the version bump and release process.

**Usage:**
```bash
./scripts/release.sh <version>
```

**Example:**
```bash
./scripts/release.sh 1.0.2
```

**What it does:**
1. ✅ Updates `manifest.json` version
2. ✅ Updates `versions.json` with new version
3. ✅ Updates `package.json` with new version 
4. ✅ Builds the plugin (`npm run build`)
5. ✅ Check lint errors (`npm run lint`)
6. ✅ Print following git commands (commit, push, tag)
7. ✅ Triggers GitHub Actions to create release

**After running:**
- Check GitHub Actions: https://github.com/youngseokyoon/obsidian-cloudflare-plugin/actions
- Verify Release: https://github.com/youngseokyoon/obsidian-cloudflare-plugin/releases

---

### 2. `submit-community.sh` - Community Plugin Submission

Semi-automated script for submitting to Obsidian Community Plugins.

**Usage:**
```bash
./scripts/submit-community.sh
```

**What it does:**
1. ✅ Clones/updates your obsidian-releases fork
2. ℹ️  Shows plugin entry JSON to add
3. ⏸️  Waits for you to manually edit `community-plugins.json`
4. ✅ Commits and pushes changes
5. ℹ️  Provides PR template

**Manual step required:**
- Edit `../obsidian-releases/community-plugins.json`
- Add the plugin entry in alphabetical order

---

### 3. `dev.js` - Development Mode

Automated development setup with hot-reload.

**Usage:**
```bash
npm run dev
```

**What it does:**
1. ✅ Finds all Obsidian vaults
2. ✅ Lets you select target vault
3. ✅ Installs hot-reload plugin
4. ✅ Copies plugin to vault
5. ✅ Watches for changes

---

## Complete Release Workflow

### First Release (v1.0.1)

```bash
# 1. Release
./scripts/release.sh 1.0.1

# 2. Wait for GitHub Actions to complete
# Check: https://github.com/youngseokyoon/obsidian-cloudflare-plugin/actions

# 3. Submit to community (first time only)
./scripts/submit-community.sh

# 4. Create PR on GitHub
# Follow the instructions from submit-community.sh
```

### Subsequent Releases (v1.0.2, v1.0.3, etc.)

```bash
# Just run release script
./scripts/release.sh 1.0.2

# GitHub Actions will automatically create the release
# No need to submit to community again
```

---

## Tips

### Semantic Versioning

- **Patch** (1.0.x): Bug fixes
- **Minor** (1.x.0): New features (backward compatible)
- **Major** (x.0.0): Breaking changes

### Pre-release Checklist

- [ ] All tests passing
- [ ] README updated
- [ ] CHANGELOG updated (if you have one)
- [ ] No uncommitted changes

### Troubleshooting

**Tag already exists:**
```bash
# Delete local tag
git tag -d 1.0.1

# Delete remote tag
git push origin :refs/tags/1.0.1

# Re-run release script
./scripts/release.sh 1.0.1
```

**GitHub Actions failed:**
- Check workflow logs
- Common issues: npm install failures, build errors
- Fix and re-push tag

---

## Manual Release (if scripts fail)

If automation fails, you can release manually:

```bash
# 1. Update versions
vim manifest.json  # Update version
vim versions.json  # Add new version entry

# 2. Build
npm run build

# 3. Commit
git add manifest.json versions.json
git commit -m "chore: Release v1.0.2"

# 4. Tag and push
git tag 1.0.2
git push origin master
git push origin 1.0.2
```
