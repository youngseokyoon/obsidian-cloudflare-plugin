# Cloudflare R2 Plugin for Obsidian

[English](README.md) | [한국어](README.ko.md)

This plugin uploads images to [Cloudflare R2](https://www.cloudflare.com/products/r2/) instead of storing them locally in your vault.

## Why?

Obsidian stores all data locally by design, which is perfect for text but can be improved for images. If you frequently add pictures to your notes, your vault can quickly grow in size, leading to:

- Reaching limits on free cloud storage plans
- Increased repository size if using git for backups
- Slower sync times across devices

This plugin is ideal for users who:
- Paste images to their notes daily (e.g., screenshots, diagrams)
- Want to keep their vaults lightweight
- Prefer cloud storage for images with R2's cost-effective pricing
- Need easy note sharing (single file with remote images)

## Features

- **Auto-upload on paste**: Automatically upload images when pasting into the editor
- **Local fallback**: Save images locally even if upload fails
- **Smart image sizing**: Three sizing modes
  - **Fixed**: Pixel-based sizing (80, 100, 150, 200, 300px)
  - **Percentage**: Relative sizing (50%, 75%, 100%, 150%, 200%)
  - **Auto**: Smart sizing based on image dimensions
- **Folder organization**: Organize images by frontmatter key
- **Customizable paths**: Configure R2 bucket paths and custom domains

## Installation

### From Obsidian Community Plugins

1. Open Settings → Community Plugins
2. Search for "Cloudflare R2"
3. Click Install
4. Enable the plugin

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder: `VaultFolder/.obsidian/plugins/obsidian-cloudflare-plugin/`
3. Copy the downloaded files to this folder
4. Reload Obsidian
5. Enable the plugin in Settings → Community Plugins

## Getting Started

### 1. Create Cloudflare R2 Bucket

1. Sign up for [Cloudflare](https://dash.cloudflare.com/sign-up) if you haven't already
2. Go to R2 Object Storage in your Cloudflare dashboard
3. Create a new bucket (e.g., `obsidian-images`)

### 2. Generate R2 API Token

1. In Cloudflare dashboard, go to R2 → Manage R2 API Tokens
2. Click "Create API Token"
3. Set permissions: Object Read & Write
4. Select your bucket
5. Copy the Access Key ID and Secret Access Key

### 3. Configure CORS (Important!)

Add CORS policy to your R2 bucket to allow Obsidian to upload:

```json
[
  {
    "AllowedOrigins": [
      "app://*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Type"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 4. Configure Plugin Settings

1. Open Settings → Cloudflare R2 Plugin
2. Enable "Auto Upload Plugin"
3. Enter your R2 credentials:
   - **Access Key ID**: From step 2
   - **Secret Access Key**: From step 2
   - **Endpoint**: Your R2 endpoint (e.g., `https://[account-id].r2.cloudflarestorage.com`)
   - **Bucket Name**: Your bucket name (e.g., `obsidian-images`)
   - **Path**: Optional path prefix (e.g., `notes/images`)
   - **Custom Domain**: Optional custom domain for public access

## Usage

### Basic Usage

1. Copy an image to clipboard
2. Paste into your note (`Cmd/Ctrl + V`)
3. Image is automatically uploaded to R2
4. Markdown link is inserted

### Image Sizing Modes

Choose how pasted images should be sized:

**Fixed Mode (Default)**
- Select from preset pixel values: 80, 100, 150, 200, 300
- Example: `![image|150](https://r2-url.com/image.png)`

**Percentage Mode**
- Relative sizing: 50%, 75%, 100%, 150%, 200%
- Example: `![image|100%](https://r2-url.com/image.png)`

**Auto Mode (Smart Sizing)**
- Automatically determines optimal size based on image dimensions:
  - Large images (>1200px): Reduced to 600px
  - Small images (<300px): Enlarged to 200%
  - Portrait images: Limited to 400px width
  - Landscape images: Limited to 800px width
  - Medium images: Original size

### Folder Organization

Add `imageNameKey` to your note's frontmatter to organize images:

```yaml
---
imageNameKey: project-alpha
---
```

Images will be saved to: `attachments/project-alpha/[random-id].png`

### Keep Local Copy

Enable "Keep local copy of pasted images" to save images both locally and to R2. If upload fails, the local copy is used as fallback.

## Settings

### Auto Upload Settings

- **Enable Auto Upload Plugin**: Toggle automatic upload on paste
- **Keep local copy of pasted images**: Save images to vault even after upload

### Image Sizing

- **Image sizing mode**: Choose Fixed, Percentage, or Auto
- **Fixed width**: Select pixel value (80-300)
- **Image scale**: Select percentage (50%-200%)

### R2 Configuration

- **Access Key ID**: Your R2 API access key
- **Secret Access Key**: Your R2 API secret key
- **Endpoint**: R2 storage endpoint URL
- **Bucket Name**: Target R2 bucket
- **Path**: Optional path prefix in bucket
- **Custom Domain Name**: Optional custom domain for public URLs

### Additional Settings

- **Use image name as Alt Text**: Use filename as alt text
- **Update original document**: Replace internal links with R2 links
- **Ignore note properties**: Exclude frontmatter when copying

## FAQ

**Q: How secure is this approach?**  
A: Your images are stored in your private R2 bucket. Nobody can access them unless you make the bucket public or share the URLs.

**Q: What happens if upload fails?**  
A: If "Keep local copy" is enabled, the image is saved locally and a local wiki-link is inserted. You won't lose your image.

**Q: Can I delete uploaded images?**  
A: Yes, you can manage your R2 bucket through the Cloudflare dashboard and delete images as needed.

**Q: What's the cost?**  
A: Cloudflare R2 offers 10 GB free storage per month. Beyond that, it's $0.015/GB/month with no egress fees.

**Q: Can I use a custom domain?**  
A: Yes! Configure a custom domain in R2 bucket settings and add it to the plugin settings.

**Q: Does it work on mobile?**  
A: This plugin is designed for desktop use only. Mobile support may be added in the future.

## Known Limitations

- Desktop only (mobile not supported)
- Animated GIFs from clipboard paste may not work (use drag-and-drop instead)
- Requires CORS configuration on R2 bucket

## Troubleshooting

### CORS Errors

If you see CORS-related errors:
1. Verify CORS policy is correctly set in R2 bucket settings
2. Make sure `app://*` is in AllowedOrigins
3. Wait a few minutes for CORS changes to propagate

### Upload Failures

If uploads fail:
1. Check your R2 API credentials
2. Verify bucket name and endpoint are correct
3. Ensure your R2 API token has write permissions
4. Check Cloudflare R2 dashboard for any service issues

## Development

### Building the Plugin

```bash
npm install
npm run build
```

### Development Mode

```bash
npm run dev
```

## Support

If you find this plugin helpful, please consider:
- ⭐ Starring the repository on GitHub
- 🐛 Reporting bugs and suggesting features
- 📝 Contributing to the code

## License

MIT License - see LICENSE file for details

## Credits

Inspired by [obsidian-imgur-plugin](https://github.com/gavvvr/obsidian-imgur-plugin)
