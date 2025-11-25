import { App, PluginSettingTab, Setting } from "obsidian";
import ObsidianPublish from "../publish";

/**
 * Style constants for nested settings display
 */
const NESTED_SETTINGS_STYLE = {
    paddingLeft: '20px',
    borderLeft: '2px solid var(--background-modifier-border)',
    marginTop: '10px',
    marginBottom: '20px'
} as const;

const SECTION_HEADING_STYLE = 'margin-top: 0; color: var(--text-muted);';

// Image sizing configuration
const IMAGE_WIDTH_PRESETS = [80, 100, 150, 200, 300] as const;
const IMAGE_PERCENTAGE_PRESETS = [50, 75, 100, 150, 200] as const;
const IMAGE_WIDTH_DEFAULT = 150;
const IMAGE_PERCENTAGE_DEFAULT = 100;

const IMAGE_SIZE_MODE_LABELS = {
    fixed: "Fixed (pixels)",
    percentage: "Percentage (%)",
    auto: "Auto (smart sizing)"
} as const;

/**
 * Settings tab for the Cloudflare plugin.
 * Manages configuration for auto-upload functionality and R2 storage settings.
 */
export default class PublishSettingTab extends PluginSettingTab {
    private plugin: ObsidianPublish;
    private r2SettingsContainer: HTMLDivElement;

    constructor(app: App, plugin: ObsidianPublish) {
        super(app, plugin);
        this.plugin = plugin;
    }

    /**
     * Displays the settings UI
     */
    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        new Setting(containerEl).setHeading().setName("Cloudflare plugin settings");

        const mainSettingsContainer = containerEl.createDiv();
        this.r2SettingsContainer = containerEl.createDiv();

        this.createAutoUploadToggle(mainSettingsContainer);
        this.setupR2SettingsContainer();
        this.createR2Settings(this.r2SettingsContainer);
        this.updateR2SettingsVisibility();
        this.createAdditionalSettings(mainSettingsContainer);
    }

    /**
     * Called when the settings tab is hidden.
     * Saves settings and reinitializes the image uploader.
     */
    async hide(): Promise<void> {
        await this.plugin.saveSettings();
        this.plugin.setupImageUploader();
    }

    /**
     * Creates the auto-upload toggle setting
     */
    private createAutoUploadToggle(container: HTMLElement): void {
        new Setting(container)
            .setName("Enable auto upload plugin")
            .setDesc("Automatically upload images when pasting them into the editor.")
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.autoUploadOnPaste)
                    .onChange(value => {
                        this.plugin.settings.autoUploadOnPaste = value;
                        this.updateR2SettingsVisibility();
                    })
            );
    }

    /**
     * Sets up the visual styling for the R2 settings container
     */
    private setupR2SettingsContainer(): void {
        this.r2SettingsContainer.style.paddingLeft = NESTED_SETTINGS_STYLE.paddingLeft;
        this.r2SettingsContainer.style.borderLeft = NESTED_SETTINGS_STYLE.borderLeft;
        this.r2SettingsContainer.style.marginTop = NESTED_SETTINGS_STYLE.marginTop;
        this.r2SettingsContainer.style.marginBottom = NESTED_SETTINGS_STYLE.marginBottom;

        this.r2SettingsContainer.createEl('h3', {
            text: 'Cloudflare R2 configuration',
            attr: { style: SECTION_HEADING_STYLE }
        });
    }

    /**
     * Updates the visibility of R2 settings based on auto-upload toggle
     */
    private updateR2SettingsVisibility(): void {
        this.r2SettingsContainer.style.display =
            this.plugin.settings.autoUploadOnPaste ? 'block' : 'none';
    }

    /**
     * Creates all R2 configuration settings
     */
    private createR2Settings(container: HTMLElement): void {
        this.createR2CredentialSettings(container);
        this.createR2StorageSettings(container);
    }

    /**
     * Creates R2 credential settings (access keys and endpoint)
     */
    private createR2CredentialSettings(container: HTMLElement): void {
        new Setting(container)
            .setName('Cloudflare R2 access key ID')
            .setDesc('Your Cloudflare R2 access key ID')
            .addText(text => text
                .setPlaceholder('Enter your access key ID')
                .setValue(this.plugin.settings.r2Setting?.accessKeyId || '')
                .onChange(value => this.plugin.settings.r2Setting.accessKeyId = value)
            );

        new Setting(container)
            .setName('Cloudflare R2 secret access key')
            .setDesc('Your Cloudflare R2 secret access key')
            .addText(text => text
                .setPlaceholder('Enter your secret access key')
                .setValue(this.plugin.settings.r2Setting?.secretAccessKey || '')
                .onChange(value => this.plugin.settings.r2Setting.secretAccessKey = value)
            );

        new Setting(container)
            .setName('Cloudflare R2 endpoint')
            .setDesc('Your Cloudflare R2 endpoint URL (e.g., https://account-id.r2.cloudflarestorage.com)')
            .addText(text => text
                .setPlaceholder('Enter your R2 endpoint')
                .setValue(this.plugin.settings.r2Setting?.endpoint || '')
                .onChange(value => this.plugin.settings.r2Setting.endpoint = value)
            );
    }

    /**
     * Creates R2 storage settings (bucket, path, domain)
     */
    private createR2StorageSettings(container: HTMLElement): void {
        new Setting(container)
            .setName('Cloudflare R2 bucket name')
            .setDesc('Your Cloudflare R2 bucket name')
            .addText(text => text
                .setPlaceholder('Enter your bucket name')
                .setValue(this.plugin.settings.r2Setting?.bucketName || '')
                .onChange(value => this.plugin.settings.r2Setting.bucketName = value)
            );

        new Setting(container)
            .setName("Target path")
            .setDesc("The path to store image.\\nSupport {year} {mon} {day} {random} {filename} vars. For example, /{year}/{mon}/{day}/{filename} with uploading pic.jpg, it will store as /2023/06/08/pic.jpg.")
            .addText(text => text
                .setPlaceholder("Enter path")
                .setValue(this.plugin.settings.r2Setting.path)
                .onChange(value => this.plugin.settings.r2Setting.path = value)
            );

        new Setting(container)
            .setName("R2.dev URL, custom domain name")
            .setDesc("You can use the R2.dev URL such as https://pub-xxxx.r2.dev here, or custom domain. If the custom domain name is example.com, you can use https://example.com/pic.jpg to access pic.img.")
            .addText(text => text
                .setPlaceholder("Enter domain name")
                .setValue(this.plugin.settings.r2Setting.customDomainName)
                .onChange(value => this.plugin.settings.r2Setting.customDomainName = value)
            );
    }

    /**
     * Creates additional independent settings (keep local file, alt text, update document, ignore properties)
     */
    private createAdditionalSettings(container: HTMLElement): void {
        new Setting(container)
            .setName("Keep local copy of pasted images")
            .setDesc("Save pasted images to your vault's attachment folder.")
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.keepLocalFile)
                    .onChange(value => this.plugin.settings.keepLocalFile = value)
            );

        // Image sizing mode selector
        new Setting(container)
            .setName("Image sizing mode")
            .setDesc("Choose how pasted images should be sized")
            .addDropdown(dropdown =>
                dropdown
                    .addOption("fixed", IMAGE_SIZE_MODE_LABELS.fixed)
                    .addOption("percentage", IMAGE_SIZE_MODE_LABELS.percentage)
                    .addOption("auto", IMAGE_SIZE_MODE_LABELS.auto)
                    .setValue(this.plugin.settings.imageWidthMode)
                    .onChange(value => {
                        this.plugin.settings.imageWidthMode = value as "fixed" | "percentage" | "auto";
                        this.display(); // Refresh to show/hide appropriate slider
                    })
            );

        // Conditional settings based on mode
        if (this.plugin.settings.imageWidthMode === "fixed") {
            const fixedWidthSetting = new Setting(container)
                .setName("Fixed width")
                .setDesc(`Current: ${this.plugin.settings.imageWidth}px (Options: ${IMAGE_WIDTH_PRESETS.join(', ')})`);

            fixedWidthSetting.addSlider(slider => {
                slider
                    .setLimits(0, IMAGE_WIDTH_PRESETS.length - 1, 1)
                    .setValue(this.getSliderValueFromWidth(this.plugin.settings.imageWidth))
                    .onChange(value => {
                        this.plugin.settings.imageWidth = IMAGE_WIDTH_PRESETS[value];
                        fixedWidthSetting.setDesc(`Current: ${IMAGE_WIDTH_PRESETS[value]}px (Options: ${IMAGE_WIDTH_PRESETS.join(', ')})`);
                    });
            });

            fixedWidthSetting.addExtraButton(button =>
                button
                    .setIcon("reset")
                    .setTooltip("Reset to default (150px)")
                    .onClick(() => {
                        this.plugin.settings.imageWidth = IMAGE_WIDTH_DEFAULT;
                        this.display();
                    })
            );
        } else if (this.plugin.settings.imageWidthMode === "percentage") {
            const percentageSetting = new Setting(container)
                .setName("Image scale")
                .setDesc(`Current: ${this.plugin.settings.imagePercentage}% (Options: ${IMAGE_PERCENTAGE_PRESETS.join(', ')}%)`);

            percentageSetting.addSlider(slider => {
                slider
                    .setLimits(0, IMAGE_PERCENTAGE_PRESETS.length - 1, 1)
                    .setValue(this.getSliderValueFromPercentage(this.plugin.settings.imagePercentage))
                    .onChange(value => {
                        this.plugin.settings.imagePercentage = IMAGE_PERCENTAGE_PRESETS[value];
                        percentageSetting.setDesc(`Current: ${IMAGE_PERCENTAGE_PRESETS[value]}% (Options: ${IMAGE_PERCENTAGE_PRESETS.join(', ')}%)`);
                    });
            });

            percentageSetting.addExtraButton(button =>
                button
                    .setIcon("reset")
                    .setTooltip("Reset to default (100%)")
                    .onClick(() => {
                        this.plugin.settings.imagePercentage = IMAGE_PERCENTAGE_DEFAULT;
                        this.display();
                    })
            );
        } else if (this.plugin.settings.imageWidthMode === "auto") {
            new Setting(container)
                .setName("Auto sizing rules")
                .setDesc(
                    "Images will be automatically sized based on their dimensions:\n" +
                    "• Large images (>1200px): Reduced to 600px\n" +
                    "• Small images (<300px): Enlarged to 200%\n" +
                    "• Portrait images: Limited to 400px width\n" +
                    "• Landscape images: Limited to 800px width\n" +
                    "• Medium images: Original size"
                );
        }

        new Setting(container)
            .setName("Use image name as Alt Text")
            .setDesc("Whether to use image name as Alt Text with '-' and '_' replaced with space.")
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.imageAltText)
                    .onChange(value => this.plugin.settings.imageAltText = value)
            );

        new Setting(container)
            .setName("Update original document")
            .setDesc("Whether to replace internal link with store link.")
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.replaceOriginalDoc)
                    .onChange(value => this.plugin.settings.replaceOriginalDoc = value)
            );

        new Setting(container)
            .setName("Ignore note properties")
            .setDesc("Where to ignore note properties when copying to clipboard. This won't affect original note.")
            .addToggle(toggle =>
                toggle
                    .setValue(this.plugin.settings.ignoreProperties)
                    .onChange(value => this.plugin.settings.ignoreProperties = value)
            );
    }

    /**
     * Helper method to convert image width to slider value
     */
    private getSliderValueFromWidth(width: number): number {
        const index = (IMAGE_WIDTH_PRESETS as readonly number[]).indexOf(width);
        const defaultIndex = (IMAGE_WIDTH_PRESETS as readonly number[]).indexOf(IMAGE_WIDTH_DEFAULT);
        return index >= 0 ? index : defaultIndex;
    }

    /**
     * Helper method to convert percentage to slider value
     */
    private getSliderValueFromPercentage(percentage: number): number {
        const index = (IMAGE_PERCENTAGE_PRESETS as readonly number[]).indexOf(percentage);
        const defaultIndex = (IMAGE_PERCENTAGE_PRESETS as readonly number[]).indexOf(IMAGE_PERCENTAGE_DEFAULT);
        return index >= 0 ? index : defaultIndex;
    }
}