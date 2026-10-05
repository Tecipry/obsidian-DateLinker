# Date Linker
Frontmatter of a note can contain date information, which Obsidian can display as either a "Date" or "Date & Time" type. 
Date Linker enables the creation of links to corresponding daily notes from these dates in the frontmatter of a note. 
These links are created as a seperate frontmatter property. From there, they're picked up by Obsidian which leads to them being handled like every other link in your Vault.

I created this plugin primarly for my personal use, as I couldn't find anything else to achieve this linking functionality.
I consider it feature complete regarding my own usecase - but if you need some functionality, feel free to open a feature request and I will consider it.

# Setup & Usage
Date Linker does nothing until explicitly configured.
Properties for which links should be created are called 'watched properties'.
These watched properties can be configured in two different ways:
1. On a per-note level:
	
	Define the frontmatter field `DL-watchedProperties` in a note and set it's value to a list of property names.
2. On a global level: 

	Go to settings and add names of frontmatter keys under "Globally watched properties".

When updating the managed relations for a file, Date Linker will combine per-note watched properties with the global ones and search for each one in the frontmatter of the note.
When a field is identified, it tries to parse a date from it.
In order for this to work, the value should follow the [ISO 8601](https://de.wikipedia.org/wiki/ISO_8601) standard.
If a date can be extracted, Date Linker will generate a link to the corresponding dailyNote (using the same file format as defined in the settings of the dailyNotes plugin) and store it using the frontmatter field `DL-managedRelations` (name can be changed in the settings).
This link is then picked up by obsidian and treated as a normal link.

Note that this plugin expects full control over this managed relations property field.
Don't mix it with other properties you might be using for relationship management in your frontmatter.

## Example
Let's say you have a note with the following frontmatter:
```yaml
created: 2026-09-15T19:27:41Z
started: 2026-09-16T20:53:04Z
completed: 2026-09-20
tags:
  - testNote
  - plugin
  - development
```
Cou can add a per-note watched property by adding the following frontmatter:
```yaml
DL-watchedProperties:
  - started
```
As soon as the managed relations for this note are updated, this will create a link to the corresponding daily note for the 16th of September 2026.
Other notes with a `started` property are completely unaffected.

In order to create a link for the `completed` field in every note with such a field, add "completed" as a globally watched property in the settings.
Now, every note with a `completed` frontmatter field will be affected.

For this example, Date Linker will add the following to the frontmatter of this note (assuming the format for the daily notes is "YYYY-MM-DD"):
```yaml
DL-managedRelations:
  - "[[2026-09-15]]"
  - "[[2026-20-09]]"
```

## Updating managed relations
Date Linker exposes two commands:
1. `Update managed relations for this file`
2. `Update managed relations for all files`

You might be able to guess what they do, based on their names.
These commands are mainly useful during setup, alowing you to get a better understanding of the changes the plugin performs on your frontmatter.

There is also a toggle in the settings page to automatically update the managed relations for a file when the frontmatter updates.
Having this toggle enabled is the same as using `Update managed relations for this file` after every frontmatter edit of a file.
The plugin will only mass-edit frontmatter if you invoke the `Update managed relations for all files` command.

