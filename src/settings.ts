import {
	App,
	PluginSettingTab,
	Setting,
	SettingDefinitionItem,
} from 'obsidian';
import MyPlugin from './main';

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
		const globallyWatchedProperties =
			this.plugin.settings.globallyWatchedProperties;

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
					action: () => {
						globallyWatchedProperties.push('');
						this.update();
					},
				},
				onReorder: (oldIndex: number, newIndex: number) => {
					const [moved] = globallyWatchedProperties.splice(
						oldIndex,
						1,
					);
					if (moved == null) {
						return;
					}
					globallyWatchedProperties.splice(newIndex, 0, moved);
					void this.plugin.saveData(this.plugin.settings); // !would fail silently in case of error
					this.update();
				},
				onDelete: (index: number) => {
					this.plugin.settings.globallyWatchedProperties.splice(
						index,
						1,
					);
					void this.plugin.saveData(this.plugin.settings); // !would fail silently in case of error
					this.update();
				},
				items: globallyWatchedProperties.map((property, index) => ({
					name: property || 'Property',
					searchable: false,
					render: (setting: Setting) => {
						setting.addText((text) =>
							text
								.setValue(property)
								.setPlaceholder('e.g. completedDate')
								.onChange(async (value) => {
									globallyWatchedProperties[index] = value;
									await this.plugin.saveData(
										this.plugin.settings,
									);
								}),
						);
					},
				})),
			},
		];
	}
}
