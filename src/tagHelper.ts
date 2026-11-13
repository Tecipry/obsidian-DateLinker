import { App, TFile, getAllTags } from 'obsidian';

export function getAllTagsInVault(app: App): string[] {
	const files: TFile[] = app.vault.getMarkdownFiles();
	const tags = new Set<string>();

	for (const file of files) {
		const cache = app.metadataCache.getFileCache(file);
		if (!cache) {
			continue;
		}
		const fileTags = getAllTags(cache) ?? [];

		fileTags.forEach((tag) => tags.add(tag));
	}

	return [...tags];
}
