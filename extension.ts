// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('snake-trail is activated');

	var ranges = [];

	var snakeDecorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(0,255,0,1.0)',
	});

	var activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (activeEditor !== editor) {
			ranges = [];
		}

		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			event.contentChanges.forEach((contentChange) => {
				ranges.push(contentChange.range);
			});

			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	var timeout = null;
	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(updateDecorations, 50);
	}

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		var _ranges = ranges;

		var decorators : vscode.DecorationOptions[] = [];
		_ranges.forEach((range) => {
			var decoration = { range: range, hoverMessage: 'Hello' };
			decorators.push(decoration);
		});

		activeEditor.setDecorations(snakeDecorationType, decorators);
	}
}

