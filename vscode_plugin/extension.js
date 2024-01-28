// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let customTerminal = vscode.window.createTerminal('readMeSimplified Terminal'); // Declare a variable to store the terminal
const filePath = path.join(__dirname, './Readme.md');
// const pythonPath = path.join(__dirname, './getCommands.py');
const textPath = path.join(__dirname, './doc2cli.txt');

// Get the readme
// fs.readFile(filePath, 'utf8', (err, data) => {
// 	if (err) {
// 		console.error(err);
// 		return;
// 	}
// 	// Process the file content here
// 	let combinedData = '"""In the given input, find all the terminal commands and' +
// 					   ' output it in a format where each individual line is ' + 
// 					   'a terminal command. Please dont include any explanation. The ' + 
// 					   'output should be: ' +
// 					   '<Replace terminal command 1 on line 1>\n' +
// 					   '<Replace terminal command 2 on line 2>\n....' +
// 					   'The input file is: '+data+'"""';
// 	let encodedString = btoa(combinedData);
// 	exec('sh ~/venvs/robot_arm/bin/activate && python3 '+pythonPath + ' '+encodedString, (error, stdout, stderr) => {
// 		if (error) {
// 			console.error(`Error: ${error}`);
// 			return;
// 		}
// 		if (stderr) {
// 			console.error(`stderr: ${stderr}`);
// 			return;
// 		}
// 		if (stdout) {
// 			console.log(`stdout: ${stdout}`);
// 			return;
// 		}
// 	});
// });

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
		// List of terminal commands to choose from
		// const commands = [
		// 	{ label: 'echo Hello World', description: 'Prints Hello World to the terminal' },
		// 	{ label: 'ls', description: 'Lists files in the current directory' },
		// 	// Add more commands as needed
		// ];
		// Show QuickPick menu to choose a terminal command
		// const selectedCommand = await vscode.window.showQuickPick(commands, { placeHolder: 'Select a terminal command' });
		const userInput = await vscode.window.showInputBox({
            prompt: 'Tell us what you want to install:',
            placeHolder: 'Text will be stored here',
        });
		
		// Example data you want to send in the POST request
		const prompt = 'https://ee54-76-132-138-253.ngrok-free.app/prod/'+encodeURIComponent(userInput);

		// let dataOutput = await fetch(prompt)
		// 	.then(response => {
		// 		// Check if the request was successful
		// 		if (!response.ok) {
		// 			throw new Error('Network response was not ok');
		// 		}
		// 		dataOutput = response.text();
		// 		return response.text();
		// 	})
		// 	.catch(error => {
		// 		console.error('Fetching HTML failed:', error);
		// 	});
		let dataOutput;
		fetchHtml(prompt).then(async (html) => {
			dataOutput = html;
			// Text file creation
			fs.writeFile(textPath, dataOutput, (err) => {
				if (err) {
					console.error('An error occurred:', err);
					return;
				}
				console.log('File was saved!');
				const filePath = vscode.Uri.file(textPath);
				// Open the file
				vscode.workspace.openTextDocument(filePath).then(doc => {
					vscode.window.showTextDocument(doc);
				});

			});
			let splitCommands = dataOutput.split("$: ");
			let splitSentences = splitCommands.map(splitCommand => splitCommand.split("\n")[0]);
		
			// console.log(splitSentences);
			if (splitCommands.length) {
				// Ask for confirmation
					for (var i=0; i < splitCommands.length; i++) {
					  const confirmation = await vscode.window.showInformationMessage(
						  `Execute the command: "${splitSentences[i]}"?`,
						  'Yes',
						  'No'
					  );
				  
					  if (confirmation === 'Yes') {
						  // Execute the selected command in the terminal
						  // If terminal doesn't exist, create one
						  if (!customTerminal) {
							  customTerminal = vscode.window.createTerminal('readMeSimplified Terminal');
						  }
					  
						  // Execute the selected command in the terminal
						  customTerminal.sendText(splitSentences[i]);
						  customTerminal.show();
					  }
				  }
			  }

			// console.log(splitSentences[1][0]);
		}).catch(error => {
			console.log('Failed to fetch HTML:', error);
		});

		
		// if (splitSentences.length) {
		//   // Ask for confirmation
		//   	for (var i=0; i < splitCommands.length; i++) {
		// 		const confirmation = await vscode.window.showInformationMessage(
		// 			`Execute the command: "${selectedCommand.label}"?`,
		// 			'Yes',
		// 			'No'
		// 		);
			
		// 		if (confirmation === 'Yes') {
		// 			// Execute the selected command in the terminal
		// 			// If terminal doesn't exist, create one
		// 			if (!customTerminal) {
		// 				customTerminal = vscode.window.createTerminal('readMeSimplified Terminal');
		// 			}
				
		// 			// Execute the selected command in the terminal
		// 			customTerminal.sendText(selectedCommand.label);
		// 			customTerminal.show();
		// 		}
		// 	}
		// }		
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {
	// Dispose of the terminal when the extension is deactivated
	// if (customTerminal) {
	// 	customTerminal.dispose();
	// }
}

module.exports = {
	activate,
	deactivate
}
