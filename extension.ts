// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('snake-trail is activated');

	var ranges = [];

	var opacities = ['ff', 'dd', 'bb', '99', '77', '55', '33', '11'].reverse();
	//var opacities = ['ff', 'bb', '77', '33', '11'].reverse();
	//var textOpacities = opacities.slice().reverse();
	var textOpacities = ['ff', 'ff', 'ff', 'ff', '00', '00', '00', '00'];

	var snakeDecorations = [];
	for (var i = 0; i < opacities.length; ++i) {
		snakeDecorations.push(
			vscode.window.createTextEditorDecorationType({
				light: {
					backgroundColor: '#ffff00' + opacities[i]
					//backgroundColor: '#ffff00ff'
				},
				dark: {
					backgroundColor: '#' + opacities[i] + opacities[i] + '00',
					//backgroundColor: '#ffff00' + opacities[i],
					//backgroundColor: '#ffff00ff',
					color: '#' + textOpacities[i] + textOpacities[i] + textOpacities[i],
					//color: '#000000'
				}
			})
		);
	}

	var snakeDecorationType = vscode.window.createTextEditorDecorationType({
		light: {
			backgroundColor: '#ffff00'
		},
		dark: {
			backgroundColor: '#ffff00',
			color: '#000000'
		}
		//backgroundColor: 'rgba(255,0,0,1.0); -webkit-transition: background-color 5s ease-in-out;',

		//borderWidth: '0px; background-color: rgba(255,0,0,1.0); transition: all 2s ease;'
		//borderWidth: '1px',
		// borderStyle: 'solid',
		// overviewRulerColor: 'blue',
		// overviewRulerLane: vscode.OverviewRulerLane.Right,
		// light: {
		// 	//color: '#00ff00; font-weight: bold'
		// 	//color: '#00ff00 !important; -webkit-transition: borderColor 5s ease-in-out !important;',
		// 	//color: '#00ff00 !important; opacity: 0.1; -webkit-transition: opacity 5s ease-in-out !important;',
		// 	//borderColor: 'darkblue'
		// },
		// dark: {
		// 	//color: '#00ff00; font-weight: bold'
		// 	//color: '#00ff00 !important; opacity: 0; -webkit-transition: borderColor 5s ease-in-out !important;',
		// 	//color: '#00ff00 !important; opacity: 0.1; -webkit-transition: opacity 5s ease-in-out !important;',
		// 	//borderColor: 'lightblue'
		// }
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
				console.log(contentChange.text);
				if (0 === contentChange.rangeLength) {
					contentChange.rangeLength = contentChange.text.length;
					contentChange.range._end._character += contentChange.text.length;
				}

				//console.log(contentChange);
				contentChange.range.opacity = opacities.length-1;
				ranges.push(contentChange.range);

				var fn = function () {
					contentChange.range.opacity -= 1;
					triggerUpdateDecorations();

					if (0 <= contentChange.range.opacity) {
						setTimeout(fn, 100 + (10 * Math.max(contentChange.rangeLength, 30)));
					}
				};
				setTimeout(fn, 100);
			});

			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	var timeout = null;
	function triggerUpdateDecorations() {
		// if (timeout) {
		// 	clearTimeout(timeout);
		// }

		// timeout = setTimeout(updateDecorations, 100);

		if (!timeout) {
			timeout = setTimeout(updateDecorations, 100);
		}
	}

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		var prunedRanges = [];
		for (var i = 0; i < opacities.length; ++i) {
			prunedRanges.push([]);
		}

		ranges.forEach((range) => {
			if (0 < range.opacity) {
				prunedRanges[range.opacity].push(range);
			}
		});

		var _ranges = prunedRanges;

		for (var i = 0; i < prunedRanges.length; ++i) {
			var decorators: vscode.DecorationOptions[] = [];
			prunedRanges[i].forEach((range) => {
				var decoration = { range: range, hoverMessage: '.' };
				decorators.push(decoration);
			});

			activeEditor.setDecorations(snakeDecorations[i], decorators);
		}

		timeout = null;
	}
}

