// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let customTerminal = vscode.window.createTerminal('readMeSimplified Terminal'); // Declare a variable to store the terminal
const textPath = path.join(__dirname, './doc2cli.txt');

// Function to fetch HTML
async function fetchHtml(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return await response.text(); // Extract HTML as text
    } catch (error) {
        console.error('Error fetching HTML:', error);
        throw error; // Propagate the error
    }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('readmesimplified.execute', async () => {
        // Collecting user input
        const userInput = await vscode.window.showInputBox({
            prompt: 'Tell us what you want to install:',
            placeHolder: 'Text will be stored here',
        });
        if (!userInput) {
            return; // Exit if no input is provided
        }

        // Fetching HTML content
        vscode.window.showInformationMessage("Fetching HTML content...");
        const prompt = 'http://127.0.0.1:7001/prod/' + encodeURIComponent(userInput);
        let dataOutput;
        try {
            dataOutput = await fetchHtml(prompt);
        } catch (error) {
            console.log('Failed to fetch HTML:', error);
            vscode.window.showErrorMessage('Failed to fetch HTML: ' + error.message);
            return;
        }

        // Writing to text file
        vscode.window.showInformationMessage("Saving commands to text file...");
        const textPath = path.join(__dirname, './doc2cli.txt');
        try {
            await fs.promises.writeFile(textPath, dataOutput);
            console.log('File was saved!');
        } catch (err) {
            console.error('An error occurred:', err);
            vscode.window.showErrorMessage('An error occurred: ' + err.message);
            return;
        }

        // Opening the text file
        const filePath = vscode.Uri.file(textPath);
        await vscode.workspace.openTextDocument(filePath).then(doc => {
            vscode.window.showTextDocument(doc);
        });

        // Extracting commands
        vscode.window.showInformationMessage("Ready to execute terminal commands?", "OK").then(async selection => {
            if (selection === "OK") {
                let splitCommands = dataOutput.split("$: ");
                if (splitCommands.length > 1) {
                    splitCommands.shift(); // Remove the portion before the first occurrence
                }
                let splitSentences = splitCommands.map(splitCommand => splitCommand.split("\n")[0]);

                if (splitCommands.length) {
                    for (let i = 0; i < splitCommands.length; i++) {
                        const confirmation = await vscode.window.showInformationMessage(
                            `Execute the command: "${splitSentences[i]}"?`,
                            'Yes',
                            'No'
                        );

                        if (confirmation === 'Yes') {
                            let customTerminal = vscode.window.createTerminal('readMeSimplified Terminal');
                            customTerminal.sendText(splitSentences[i]);
                            customTerminal.show();
                        }
                    }
                }
            }
        });
    });

    context.subscriptions.push(disposable);
}

async function fetchHtml(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
    }
    return await response.text();
}

module.exports = {
    activate,
    deactivate: function() {}
}
