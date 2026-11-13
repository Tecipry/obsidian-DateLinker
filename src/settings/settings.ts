import { App, PluginSettingTab, SettingDefinitionItem } from 'obsidian';
import MyPlugin from '../main';
import { AddEntryModal, FolderSuggestModal, TagSuggestModal } from './modals';

export interface DateLinkerSettings {
	watchedPropertysFrontmatterFieldName: string;
	managedRelationsPropertyName: string;
	automaticallyWatchFilesForFrontmatterChanges: boolean;
	globallyWatchedProperties: Array<string>;
	excludedFolders: Array<string>;
	excludedTags: Array<string>;
}

export const DEFAULT_SETTINGS: DateLinkerSettings = {
	watchedPropertysFrontmatterFieldName: 'DL-watchedProperties',
	managedRelationsPropertyName: 'DL-managedRelations',
	automaticallyWatchFilesForFrontmatterChanges: false,
	globallyWatchedProperties: [],
	excludedFolders: [],
	excludedTags: [],
};

export class DateLinkerSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private openAddFolderModal() {
		new FolderSuggestModal(this.app, (folder) => {
			const folders = this.plugin.settings.excludedFolders;
			if (folders.includes(folder.path)) return;

			folders.push(folder.path);
			void this.plugin.saveData(this.plugin.settings);
			this.update();
		}).open();
	}

	private openAddTagModal() {
		new TagSuggestModal(this.app, (tag) => {
			const tags = this.plugin.settings.excludedTags;
			if (tags.includes(tag)) return;

			tags.push(tag);
			void this.plugin.saveData(this.plugin.settings);
			this.update();
		}).open();
	}

	private openAddGlobalPropertyModal() {
		new AddEntryModal(this.app, 'Name of property', (entry: string) => {
			const properties = this.plugin.settings.globallyWatchedProperties;
			properties.push(entry);
			// convert to set and back to array -> ensure unique entries
			this.plugin.settings.globallyWatchedProperties = Array.from(
				new Set(properties),
			);

			void this.plugin.saveData(this.plugin.settings);
			this.update();
		}).open();
	}

	getSettingDefinitions(): SettingDefinitionItem<string>[] {
		const settings = this.plugin.settings;

		return [
			{
				name: 'Frontmatter field name to define watched properties',
				desc: 'Use this frontmatter field to list the properties, for which links should be created in the corresponding note',
				control: {
					type: 'text',
					key: 'watchedPropertysFrontmatterFieldName',
				},
			},
			{
				name: 'Frontmatter field name to use for the managed relations',
				desc: 'The created relation links are written into this frontmatter field, so they can be picked up by Obsidian',
				control: {
					type: 'text',
					key: 'managedRelationsPropertyName',
				},
			},
			{
				name: 'Automatically update managed relations when frontmatter updates',
				desc: 'Requires reload to take effect',
				control: {
					type: 'toggle',
					key: 'automaticallyWatchFilesForFrontmatterChanges',
				},
			},
			{
				type: 'list',
				heading: 'Globally watched properties',
				desc: 'These properties will be watched on every note, without the need to add them as a watched property everywhere.',
				emptyState: 'No globally watched properties yet.',
				addItem: {
					name: 'Add property',
					action: () => this.openAddGlobalPropertyModal(),
				},
				onDelete: (index: number) => {
					settings.globallyWatchedProperties.splice(index, 1);
					void this.plugin.saveData(settings);
					this.update();
				},
				items: settings.globallyWatchedProperties.map((property) => ({
					name: property || 'Property',
					searchable: false,
				})),
			},
			{
				type: 'list',
				heading: 'Excluded Folders',
				desc: 'Notes within these folders will be excluded from processing.',
				emptyState: 'No excluded folders yet.',
				addItem: {
					name: 'Add excluded folder',
					action: () => this.openAddFolderModal(),
				},
				onDelete: (index: number) => {
					settings.excludedFolders.splice(index, 1);
					void this.plugin.saveData(settings);
					this.update();
				},
				items: settings.excludedFolders.map((path) => ({
					name: path,
					searchable: false,
				})),
			},
			{
				type: 'list',
				heading: 'Excluded Tags',
				desc: 'Notes with any of these tags will be excluded when processsing.',
				emptyState: 'No excluded tags yet.',
				addItem: {
					name: 'Add excluded tag',
					action: () => this.openAddTagModal(),
				},
				onDelete: (index: number) => {
					settings.excludedTags.splice(index, 1);
					void this.plugin.saveData(settings);
					this.update();
				},
				items: settings.excludedTags.map((tag) => ({
					name: tag,
					searchable: false,
				})),
			},
		];
	}
}
