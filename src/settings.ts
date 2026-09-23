import { App, PluginSettingTab } from 'obsidian';
import MyPlugin from './main';

export interface DateLinkerSettings {
	dailyNoteNameFormat: string;
	watchedPropertysFrontmatterFieldName: string;
	managedRelationsPropertyName: string;
	automaticallyWatchFilesForFrontmatterChanges: boolean;
}

export const DEFAULT_SETTINGS: DateLinkerSettings = {
	dailyNoteNameFormat: 'YYYY-MM-DD',
	watchedPropertysFrontmatterFieldName: 'DL-watchedProperties',
	managedRelationsPropertyName: 'DL-managedRelations',
	automaticallyWatchFilesForFrontmatterChanges: false,
};

export class DateLinkerSettingTab extends PluginSettingTab {
	display(): void {
		throw new Error('Method not implemented.');
	}
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions() {
		return [
			{
				name: 'DailyNote name format',
				desc: 'momentjs format string to determine the name of your daily note',
				control: {
					type: 'text',
					key: 'dailyNoteNameFormat',
					placeholder: DEFAULT_SETTINGS.dailyNoteNameFormat,
				},
			},
			{
				name: 'Frontmatter field name to define watched properties',
				desc: 'Use this frontmatter field to list the properties, for which links should be created in the corresponding note',
				control: {
					type: 'text',
					key: 'watchedPropertysFrontmatterFieldName',
					placeholder: DEFAULT_SETTINGS.watchedPropertysFrontmatterFieldName,
				},
			},
			{
				name: 'Frontmatter field name to use for the managed relations',
				desc: 'The created relation links are written into this frontmatter field, so they can be picked up by Obsidian',
				control: {
					type: 'text',
					key: 'managedRelationsPropertyName',
					placeholder: DEFAULT_SETTINGS.managedRelationsPropertyName,
				},
			},
			{
				name: 'Automatically update managed relations when frontmatter updates',
				desc: 'Requires reload to take effect',
				control: {
					type: 'toggle',
					key: 'automaticallyWatchFilesForFrontmatterChanges',
					placeholder: DEFAULT_SETTINGS.automaticallyWatchFilesForFrontmatterChanges,
				},
			},
		];
	}
}
