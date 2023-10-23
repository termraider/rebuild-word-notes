import { Notice, Plugin, Modal, Folder, TFile } from 'obsidian';

export default class MyPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'delete-and-recreate-notes',
            name: 'Delete and Recreate Notes in Folder',
            callback: () => this.processFolder(),
            hotkeys: []
        });
    }

    async promptForFolderPath(): Promise<string | null> {
        return new Promise((resolve) => {
            class FolderPathModal extends Modal {
                constructor(app) {
                    super(app);
                }

                onOpen() {
                    const { el } = this;
                    const promptDiv = el.createDiv();
                    promptDiv.setText('Enter the folder path: ');

                    const input = promptDiv.createEl('input', { type: 'text' });
                    let folderPath = '';
                    input.addEventListener('input', (e) => folderPath = e.target.value);

                    const submitButton = promptDiv.createEl('button');
                    submitButton.setText('Submit');
                    submitButton.addEventListener('click', () => {
                        this.close();
                        resolve(folderPath);
                    });
                }
            }

            new FolderPathModal(this.app).open();
        });
    }

    async processFolder() {
        const folderPath = await this.promptForFolderPath();
        if (!folderPath) {
            new Notice('No path provided.');
            return;
        }

        const folder = this.app.vault.getAbstractFileByPath(folderPath);

        if (!folder || !(folder instanceof Folder)) {
            new Notice('Folder not found.');
            return;
        }

        // Get all note files in the folder.
        const notes = folder.children.filter(file => file instanceof TFile);

        // Save note names.
        const noteNames = notes.map(note => note.basename);

        // Delete all notes.
        for (const note of notes) {
            await this.app.vault.delete(note);
        }

        // Create new notes with saved names.
        for (const name of noteNames) {
            await this.app.vault.create(name + '.md', '');
        }

        new Notice('Notes processed successfully.');
    }
}
