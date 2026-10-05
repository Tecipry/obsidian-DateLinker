import { App, Modal, Setting } from 'obsidian';

export class AddEntryModal extends Modal {
	constructor(app: App, name:string, onSubmit: (result: string) => void) {
		super(app);

		let input = '';
		new Setting(this.contentEl).setName(name).addText((text) =>
			text.onChange((value) => {
				input = value;
			}),
		);

		new Setting(this.contentEl).addButton((btn) =>
			btn
				.setButtonText('Submit')
				.setCta()
				.onClick(() => {
					this.close();
					onSubmit(input);
				}),
		);
	}
}
