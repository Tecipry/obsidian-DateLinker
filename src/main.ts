import { CachedMetadata, Notice, Plugin, TFile, moment } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	DateLinkerSettings,
	DateLinkerSettingTab,
} from './settings';
import {
	getDailyNoteSettings,
	IPeriodicNoteSettings,
} from 'obsidian-daily-notes-interface';

export default class DateLinker extends Plugin {
	settings!: DateLinkerSettings;
	frontmatterHashes = new Map<string, string>();

	dailyNoteSettings: IPeriodicNoteSettings = getDailyNoteSettings();
	dailyNotesFormat: string = `${this.dailyNoteSettings.format}`;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DateLinkerSettingTab(this.app, this));

		if (this.settings.automaticallyWatchFilesForFrontmatterChanges) {
			this.registerEvent(
				this.app.metadataCache.on(
					'changed',
					(file: TFile, data: string, cache: CachedMetadata) => {
						// check for frontmatter change
						// maybe the field storing the managed relations should be excluded here. Currently, this reports a frontmatter change two times in a row
						const fmHash = JSON.stringify(cache.frontmatter ?? {});
						const storedHash = this.frontmatterHashes.get(
							file.path,
						);
						if (storedHash === fmHash) {
							return;
						}
						this.frontmatterHashes.set(file.path, fmHash);

						void this.processFrontmatterForSingleFile(file);
					},
				),
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
				if (!activeFile) {
					return;
				}
				void this.processFrontmatterForSingleFile(activeFile);
				new Notice(`Processed note.`);
			},
		});
	}

	onunload() { }

	async processFrontmatterForAllFiles(): Promise<void> {
		const files: TFile[] = this.app.vault.getMarkdownFiles();
		let modifiedCount = 0;

		for (const file of files) {
			void this.processFrontmatterForSingleFile(file);
			modifiedCount++;
		}

		new Notice(`Processed ${modifiedCount} note(s).`);
	}

	async processFrontmatterForSingleFile(file: TFile): Promise<void> {
		const frontmatter =
			this.app.metadataCache.getFileCache(file)?.frontmatter;
		if (!frontmatter) {
			return;
		}

		// get frontmatter & concat with globallyWatchedProperties
		const rawValue: string[] = frontmatter[
			this.settings.watchedPropertysFrontmatterFieldName
		] as string[];

		// Set to ensure uniqueness
		const propertiesToCheckForDates: Set<string> = new Set(rawValue);
		this.settings.globallyWatchedProperties.forEach(element => {
			propertiesToCheckForDates.add(element);
		});

		console.log(propertiesToCheckForDates);

		let managedRelations: Array<string> = [];

		// extract dates
		for (const property of propertiesToCheckForDates) {
			if (!Object.prototype.hasOwnProperty.call(frontmatter, property)) {
				// specified property is not in frontmatter
				continue;
			}

			const dateRaw: string = frontmatter[property] as string;
			const parsedDate: moment.Moment = moment(
				dateRaw,
				'YYYY-MM-DDTHH:mm:ssZ',
			);
			if (!parsedDate.isValid()) {
				continue;
			}

			managedRelations.push(
				`[[${parsedDate.format(this.dailyNotesFormat)}]]`,
			);
		}

		// write dates into managedRelations
		await this.app.fileManager.processFrontMatter(
			file,
			(frontmatter: Record<string, unknown>) => {
				frontmatter[this.settings.managedRelationsPropertyName] =
					managedRelations;
			},
		);
	}

	async loadSettings() {
		const saved = ((await this.loadData()) ??
			{}) as Partial<DateLinkerSettings>;

		// use default values for not-set properties
		const cleaned = Object.fromEntries(
			Object.entries(saved).filter(
				([, value]) =>
					value !== undefined && value !== null && value !== '',
			),
		) as Partial<DateLinkerSettings>;

		this.settings = Object.assign({}, DEFAULT_SETTINGS, cleaned);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
