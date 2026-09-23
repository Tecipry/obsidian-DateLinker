# Date Linker
Frontmatter of a note can contain date information, either as a "Date" or "Date & Time" datatype. Date Linker enables the creation of links to corresponding daily notes from these dates in the frontmatter of a file. These links are created as a seperate frontmatter property. From there, they're picked up by Obsidian as normal links between notes.

# Setup & Usage
Date Linker does nothing until explicitly configured. Linking behaviour for a note is configured by setting `DL-watchedProperties` as a frontmatter property in the note (property name can be changed in the settings). Date Linker will try to create links for every property listed in `DL-watchedProperties`.

There are two ways to trigger link creation from these watched properties:
1. Using the command palette
	
	There are two commands to either update the managed relations of the currently active file or to update the managed relations of all files in the vault. They're named `Update managed relations for this file` and `Update managed relations for all files` accordingly. This is mainly useful during setup, allowing you to better understand it's behaviour before letting it loose on your whole vault.

2. Automatically updating on frontmatter change

	When enabling `Automatically update managed relations when frontmatter updates` in the settings, Date Linker will automatically watch for frontmatter changes and update the managed links accordingly. The same behaviour can be achieved by using the command `Update managed relations for this file` every time after changing the frontmatter of a file.