import { App, Notice, Editor, normalizePath } from "obsidian";
import ImageUploader from "./uploader/imageUploader";
import { PublishSettings } from "./publish";

export default class PasteListener {
    private app: App;
    private getSettings: () => PublishSettings;
    private getImageUploader: () => ImageUploader;

    constructor(app: App, getSettings: () => PublishSettings, getImageUploader: () => ImageUploader) {
        this.app = app;
        this.getSettings = getSettings;
        this.getImageUploader = getImageUploader;
    }

    public async handlePaste(evt: ClipboardEvent, editor: Editor): Promise<void> {
        const settings = this.getSettings();
        if (!settings.autoUploadOnPaste) {
            return;
        }

        const files = evt.clipboardData?.files;
        if (!files || files.length === 0) {
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith("image/")) {
                evt.preventDefault();
                evt.stopPropagation();

                // Generate a unique filename
                const extension = file.type.split("/")[1] || "png";
                let filenameBase = "";

                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    const frontmatter = this.app.metadataCache.getFileCache(activeFile)?.frontmatter;
                    if (frontmatter && frontmatter["imageNameKey"]) {
                        filenameBase = `${frontmatter["imageNameKey"]}/`;
                    }
                }

                const randomString = this.generateRandomString(12);
                const filename = `${filenameBase}${randomString}.${extension}`;

                // Save to local vault first if enabled (independent of upload)
                let localPath = "";
                if (settings.keepLocalFile) {
                    const savedPath = await this.saveFileToVault(file, filename);
                    if (savedPath) {
                        localPath = savedPath;
                    }
                }

                // Calculate width parameter based on sizing mode
                let widthParam = "";
                if (settings.imageWidthMode === "fixed") {
                    widthParam = settings.imageWidth > 0 ? `|${settings.imageWidth}` : "";
                } else if (settings.imageWidthMode === "percentage") {
                    widthParam = `|${settings.imagePercentage}%`;
                } else if (settings.imageWidthMode === "auto") {
                    // Read image dimensions and calculate optimal size
                    const dimensions = await this.getImageDimensions(file);
                    widthParam = this.calculateAutoWidth(dimensions);
                }

                // Try to upload to R2 if auto-upload is enabled
                let imageLink: string;
                const altText = settings.imageAltText ? filename.replace(/\.[^/.]+$/, "") : "";

                if (settings.autoUploadOnPaste) {
                    new Notice(`Uploading ${filename}...`);
                    try {
                        const uploader = this.getImageUploader();
                        const imgUrl = await uploader.upload(file, filename);
                        imageLink = `![${altText}${widthParam}](${imgUrl})`;
                        new Notice(`Uploaded ${filename}`);
                    } catch (error: unknown) {
                        const errorMsg = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
                        new Notice(`Failed to upload ${filename}: ${errorMsg}`);

                        // Fallback to local path if available
                        if (localPath) {
                            imageLink = `![[${filename}${widthParam}]]`;
                        } else {
                            return; // Can't insert anything
                        }
                    }
                } else {
                    // No upload, use local path
                    if (localPath) {
                        imageLink = `![[${filename}${widthParam}]]`;
                    } else {
                        return; // Can't insert anything
                    }
                }

                // Insert the image link at the cursor
                const cursor = editor.getCursor();
                editor.replaceRange(imageLink, cursor);
            }
        }
    }

    private generateRandomString(length: number): string {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    private async saveFileToVault(file: File, filename: string): Promise<string> {
        try {
            const arrayBuffer = await file.arrayBuffer();

            // Get attachment folder path from vault config
            interface VaultWithConfig { config: { attachmentFolderPath?: string } }
            const attachmentFolderPath = (this.app.vault as unknown as VaultWithConfig).config.attachmentFolderPath || '.';
            const activeFile = this.app.workspace.getActiveFile();

            let targetPath: string;
            if (attachmentFolderPath.startsWith('./') && activeFile) {
                // Relative to current file
                const parentPath = activeFile.parent?.path || '';
                targetPath = `${parentPath}/${attachmentFolderPath.substring(2)}/${filename}`;
            } else {
                // Absolute or root-relative
                targetPath = `${attachmentFolderPath}/${filename}`;
            }

            // Normalize path
            targetPath = normalizePath(targetPath);

            // Create directory if filename contains path separators
            const lastSlashIndex = targetPath.lastIndexOf('/');
            if (lastSlashIndex > 0) {
                const dirPath = targetPath.substring(0, lastSlashIndex);
                // Check if directory exists, create if not
                const dirExists = await this.app.vault.adapter.exists(dirPath);
                if (!dirExists) {
                    await this.app.vault.adapter.mkdir(dirPath);
                }
            }

            // Create the file in the vault
            await this.app.vault.adapter.writeBinary(targetPath, arrayBuffer);

            return targetPath;
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
            new Notice(`Failed to save file to vault: ${filename} : ${errorMsg}`, 5000);
            throw error; // Re-throw to indicate failure
        }
    }

    /**
     * Get image dimensions from file
     */
    private async getImageDimensions(file: File): Promise<{ width: number, height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
                URL.revokeObjectURL(img.src);
            };
            img.onerror = () => {
                reject(new Error('Failed to load image'));
                URL.revokeObjectURL(img.src);
            };
            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Calculate optimal width based on image dimensions
     */
    private calculateAutoWidth(dimensions: { width: number, height: number }): string {
        const { width, height } = dimensions;
        const aspectRatio = width / height;

        // Large screenshots (width > 1200px)
        if (width > 1200) {
            return "|600";
        }

        // Small icons/logos (width < 300px)
        if (width < 300) {
            return "|200%";
        }

        // Tall images (portrait)
        if (aspectRatio < 0.7) {
            return "|400";
        }

        // Wide images (landscape)
        if (aspectRatio > 1.5) {
            return "|800";
        }

        // Medium size - use original
        return "";
    }
}
