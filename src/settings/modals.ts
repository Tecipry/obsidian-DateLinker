import { App, Modal, Setting, FuzzySuggestModal, TFolder } from 'obsidian';

export class AddEntryModal extends Modal {
	constructor(
		app: App,
		name: string,
		onSubmit: (result: string) => void
	) {
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

export class FolderSuggestModal extends FuzzySuggestModal<TFolder> {
	constructor(
		app: App,
		private onChoose: (folder: TFolder) => void
	) {
		super(app);
		this.setPlaceholder("Select a folder…");
	}

	getItems(): TFolder[] {
		return this.app.vault.getAllFolders();
	}

	getItemText(folder: TFolder): string {
		return folder.path;
	}

	onChooseItem(folder: TFolder): void {
		this.onChoose(folder);
	}
}
