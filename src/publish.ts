import {
    Notice,
    Plugin,
    MarkdownView,
} from "obsidian";

import ImageTagProcessor, { ACTION_PUBLISH } from "./uploader/imageTagProcessor";
import ImageUploader from "./uploader/imageUploader";
import buildUploader from "./uploader/imageUploaderBuilder";
import PublishSettingTab from "./ui/publishSettingTab";
import { R2Setting } from "./uploader/r2/r2Uploader";
import PasteListener from "./pasteListener";

export interface PublishSettings {
    imageAltText: boolean;
    replaceOriginalDoc: boolean;
    ignoreProperties: boolean;
    autoUploadOnPaste: boolean;
    keepLocalFile: boolean;
    imageWidth: number;
    r2Setting: R2Setting;
}

const DEFAULT_SETTINGS: PublishSettings = {
    imageAltText: true,
    replaceOriginalDoc: false,
    ignoreProperties: true,
    autoUploadOnPaste: false,
    keepLocalFile: true,
    imageWidth: 150,
    r2Setting: {
        accessKeyId: "",
        secretAccessKey: "",
        endpoint: "",
        bucketName: "",
        path: "",
        customDomainName: "",
    },
};
export default class ObsidianPublish extends Plugin {
    settings: PublishSettings;
    imageTagProcessor: ImageTagProcessor;
    imageUploader: ImageUploader;
    statusBarItem: HTMLElement;
    pasteListener: PasteListener;

    async onload() {
        await this.loadSettings();
        // Create status bar item that will be used if modal is disabled
        this.statusBarItem = this.addStatusBarItem();
        this.setupImageUploader();

        this.addCommand({
            id: "publish-page",
            name: "Publish Page",
            checkCallback: (checking: boolean) => {
                if (!checking) {
                    this.publish()
                }
                return true;
            }
        });
        this.addSettingTab(new PublishSettingTab(this.app, this));

        // Initialize PasteListener with getters to ensure it always uses the latest settings and uploader
        this.pasteListener = new PasteListener(
            this.app,
            () => this.settings,
            () => this.imageUploader
        );
        this.registerDomEvent(document, 'paste', (evt: ClipboardEvent) => {
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
                this.pasteListener.handlePaste(evt, activeView.editor);
            }
        }, true); // Use capture phase to intercept before Obsidian handles it
    }

    onunload() {
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as PublishSettings);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private publish(): void {
        if (!this.imageUploader) {
            new Notice("Image uploader setup failed, please check setting.")
        } else {
            this.imageTagProcessor.process(ACTION_PUBLISH).then(() => {
            });
        }
    }

    setupImageUploader(): void {
        try {
            this.imageUploader = buildUploader(this.settings);
            this.imageTagProcessor = new ImageTagProcessor(
                this.app,
                this.settings,
                this.imageUploader
            );
        } catch (e) {
            console.log(`Failed to setup image uploader: ${e}`)
        }
    }
}