// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as _ from 'lodash';

interface SnakeRange {
	opacity: number,
	range: vscode.Range,
	rangeLength: number,
	text: string
};

let activeEditor
let snakeOptions;
let queuedTimeout;
let snakeRanges: Array<SnakeRange> = [];
let opacities = ['0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1'].reverse();
let snakeDecorations;

export function enable() {
	initialiseSnakeTrail();
	snakeOptions.enabled = true;
}

export function disable() {
	snakeOptions.enabled = false;
	snakeRanges = [];
	snakeDecorations.forEach((snakeDecoration) => {
		if (activeEditor) {
			activeEditor.setDecorations(snakeDecoration, []);
		}
	});
}

export function refresh() {
	initialiseSnakeTrail();
}

function initialiseSnakeTrail() {
	let snakeOptionsOverrides = vscode.workspace.getConfiguration('snakeTrail');
	snakeOptions = _.clone(snakeOptionsOverrides);

	// Create the decorators
	let newSnakeDecorations = [];
	for (let i = 0; i < opacities.length; ++i) {
		newSnakeDecorations.push(
			vscode.window.createTextEditorDecorationType({
				light: {
					backgroundColor: 'rgba('+ (snakeOptions.colorLight || snakeOptions.color) + ',' + opacities[i] + ')'
				},
				dark: {
					backgroundColor: 'rgba('+ (snakeOptions.colorDark || snakeOptions.color) + ',' + opacities[i] + ')'
				}
			})
		);
	}
	snakeDecorations = newSnakeDecorations;
}

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('snake-trail is activated');
	initialiseSnakeTrail();

	var commands = [
		vscode.commands.registerCommand('snakeTrail.enable', enable),
		vscode.commands.registerCommand('snakeTrail.disable', disable),
		vscode.commands.registerCommand('snakeTrail.refresh', refresh)
	];

	commands.forEach(function (command) {
		context.subscriptions.push(command);
	});

	activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		triggerUpdateDecorations();
	}

	// Register for Active Editor changes
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (activeEditor !== editor) {
			snakeRanges = [];
		}

		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	// Register for Text Editor changes
	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document && snakeOptions.enabled) {
			event.contentChanges.forEach((contentChange) => {
				try {
					// Ensure that the range covers the change
					if (0 === contentChange.rangeLength) {
						contentChange.rangeLength = contentChange.text.length;
						contentChange.range = new vscode.Range(
							contentChange.range.start,
							new vscode.Position(contentChange.range.end.line, contentChange.range.end.character + contentChange.text.length)
						);
					}

					var snakeRange: SnakeRange = {
						opacity: opacities.length - 1,
						range: contentChange.range,
						rangeLength: contentChange.rangeLength,
						text: contentChange.text
					};
					snakeRanges.push(snakeRange);

					// Create our animation logic
					var fn = function () {
						snakeRange.opacity -= 1;
						triggerUpdateDecorations();

						if (0 <= snakeRange.opacity) {
							setTimeout(fn, snakeOptions.fadeMS + (10 * Math.max(snakeRange.rangeLength, 30)));
						}
					};
					setTimeout(fn, snakeOptions.fadeMS);
				} catch (err) {
					console.log(err);
				}
			});

			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	// Use a timer to avoid overloading the system
	var timeout = null;
	function triggerUpdateDecorations() {
		if (!timeout) {
			queuedTimeout = false;
			timeout = setTimeout(updateDecorations, 100);
		} else {
			queuedTimeout = true;
		}
	}

	// Update the decorations
	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		// Create placeholder arrays (for each opacity level)
		var prunedSnakeRanges: Array<Array<SnakeRange>> = [];
		for (var i = 0; i < opacities.length; ++i) {
			prunedSnakeRanges.push([]);
		}

		// Sort the snakeRanges into the correct array for their opacity level
		snakeRanges.forEach((snakeRange) => {
			if (0 < snakeRange.opacity) {
				prunedSnakeRanges[snakeRange.opacity].push(snakeRange);
			}
		});

		// Add the ranges to the decorator
		prunedSnakeRanges.forEach((snakeRanges, index) => {
			var decorators: vscode.DecorationOptions[] = [];
			snakeRanges.forEach((snakeRange) => {
				var decoration = { range: snakeRange.range, hoverMessage: snakeRange.text };
				decorators.push(decoration);
			});

			if (null !== snakeDecorations && index < snakeDecorations.length) {
				activeEditor.setDecorations(snakeDecorations[index], decorators);
			}
		});

		// Signal that we are done
		timeout = null;
		if (queuedTimeout) {
			triggerUpdateDecorations();
		}
	}
}
