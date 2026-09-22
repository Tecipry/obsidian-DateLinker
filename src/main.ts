import { Notice, Plugin, TFile, moment } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	DateLinkerSettings,
	DateLinkerSettingTab,
} from './settings';
// import moment from 'moment';

export default class DateLinker extends Plugin {
	settings!: DateLinkerSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DateLinkerSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(activeDocument, 'click', (_evt: MouseEvent) => {
		// 	new Notice('Click');
		// });

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

	onunload() {}

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
		const cache = this.app.metadataCache.getFileCache(file);
		const frontmatter = cache?.frontmatter;

		if (
			frontmatter &&
			Object.prototype.hasOwnProperty.call(
				frontmatter,
				'linkProbertyDatesToDailyNote',
			)
		) {
			const rawValue = frontmatter[
				'linkProbertyDatesToDailyNote'
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
					link: `[[${parsedDate.format('DD.MM.YYYY')}]]`,
				};
				managedRelations.push(relation);
			}

			await this.app.fileManager.processFrontMatter(
				file,
				(frontmatter: Record<string, unknown>) => {
					frontmatter['managed-relations'] = managedRelations;
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
