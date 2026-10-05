import {
	App,
	PluginSettingTab,
	SettingDefinitionItem,
} from 'obsidian';
import MyPlugin from './main';
import { AddEntryModal } from './modals';

export interface DateLinkerSettings {
	watchedPropertysFrontmatterFieldName: string;
	managedRelationsPropertyName: string;
	automaticallyWatchFilesForFrontmatterChanges: boolean;
	globallyWatchedProperties: Array<string>;
}

export const DEFAULT_SETTINGS: DateLinkerSettings = {
	watchedPropertysFrontmatterFieldName: 'DL-watchedProperties',
	managedRelationsPropertyName: 'DL-managedRelations',
	automaticallyWatchFilesForFrontmatterChanges: false,
	globallyWatchedProperties: [],
};

export class DateLinkerSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem<string>[] {
		let globallyWatchedProperties: string[] =
			this.plugin.settings.globallyWatchedProperties ?? [];

		let openAddGlobalPropertyModal = () => {
			new AddEntryModal(this.app, 'Name of property', (entry: string) => {
				globallyWatchedProperties.push(entry);
				// convert to set and back to array -> ensure unique entries
				this.plugin.settings.globallyWatchedProperties =
					Array.from(new Set(globallyWatchedProperties));

				void this.plugin.saveData(this.plugin.settings);
				this.update();
			}).open();
		};

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
				desc: 'These properties will be watched on every note, without the need to add them as a watched property on every note.',
				emptyState: 'No globally watched properties yet.',
				addItem: {
					name: 'Add property',
					action: openAddGlobalPropertyModal,
				},
				onDelete: (index: number) => {
					this.plugin.settings.globallyWatchedProperties.splice(
						index,
						1,
					);
					void this.plugin.saveData(this.plugin.settings); // will fail silently in case of error
					this.update();
				},
				items: globallyWatchedProperties.map((property, index) => ({
					name: property || 'Property',
					searchable: false,
				})),
			},
		];
	}
}
