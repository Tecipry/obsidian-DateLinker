import { CachedMetadata, Notice, Plugin, TFile, moment } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	DateLinkerSettings,
	DateLinkerSettingTab,
} from './settings';

export default class DateLinker extends Plugin {
	settings!: DateLinkerSettings;
	private frontmatterHashes = new Map<string, string>();

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DateLinkerSettingTab(this.app, this));

		if (this.settings.automaticallyWatchFilesForFrontmatterChanges) {
			this.registerEvent(
				this.app.metadataCache.on("changed", (file: TFile, data: string, cache: CachedMetadata) => {
					// check for frontmatter change
					// maybe the field storing the managed relations should be excluded here. Currently, this reports a frontmatter change two times in a row
					const fmHash = JSON.stringify(cache.frontmatter ?? {});
					const storedHash = this.frontmatterHashes.get(file.path)
					if (storedHash === fmHash) { return; }
					this.frontmatterHashes.set(file.path, fmHash);

					void this.processFrontmatterForFile(file);
				})
			);
		}

		this.addCommand({
			id: 'update-managed-relations-all-files',
			name: 'Update managed relations for all files',
			callback: () => {
				void this.processFrontmatterForAllFiles();
			},
		});
		this.addCommand({
			id: 'update-managed-relations-this-file',
			name: 'Update managed relations for this file',
			callback: () => {
				const activeFile = this.app.workspace.getActiveFile();
				// activeFile might be null
				if (!activeFile) {
					return;
				}
				void this.processFrontmatterForFile(activeFile);
				new Notice(`Processed note.`);
			},
		});
	}

	onunload() { }

	async processFrontmatterForAllFiles(): Promise<void> {
		const files: TFile[] = this.app.vault.getMarkdownFiles();
		let modifiedCount = 0;

		for (const file of files) {
			void this.processFrontmatterForFile(file);
			modifiedCount++;
		}

		new Notice(`Processed ${modifiedCount} note(s).`);
	}

	async processFrontmatterForFile(file: TFile): Promise<void> {
		const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
		// const frontmatter = cache?.frontmatter;

		if (
			frontmatter &&
			Object.prototype.hasOwnProperty.call(
				frontmatter,
				this.settings.watchedPropertysFrontmatterFieldName || DEFAULT_SETTINGS.watchedPropertysFrontmatterFieldName,
			)
		) {
			const rawValue = frontmatter[
				this.settings.watchedPropertysFrontmatterFieldName || DEFAULT_SETTINGS.watchedPropertysFrontmatterFieldName
			] as unknown;
			const propertysToCheckForDates: string[] = Array.isArray(rawValue)
				? (rawValue as string[])
				: typeof rawValue === 'string'
					? [rawValue]
					: [];

			let managedRelations: Array<object> = [];

			// extract dates
			for (const property of propertysToCheckForDates) {
				if (
					!Object.prototype.hasOwnProperty.call(frontmatter, property)
				) {
					// specified property is not in frontmatter
					continue;
				}

				const dateRaw: string = frontmatter[property] as string;
				const parsedDate: moment.Moment = window.moment(
					dateRaw,
					'YYYY-MM-DDTHH:mm:ssZ',
				); // importing moment from 'obsidian' doesn't work atm
				if (!parsedDate.isValid()) {
					continue;
				}

				const relation = {
					property: property,
					link: `[[${parsedDate.format(this.settings.dailyNoteNameFormat || DEFAULT_SETTINGS.dailyNoteNameFormat)}]]`,
				};
				managedRelations.push(relation);
			}

			await this.app.fileManager.processFrontMatter(
				file,
				(frontmatter: Record<string, unknown>) => {
					frontmatter[this.settings.managedRelationsPropertyName || DEFAULT_SETTINGS.managedRelationsPropertyName] = managedRelations;
				},
			);
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<DateLinkerSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
