'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "me" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.formatCase', () => {
        // The code you place here will be executed every time your command is executed

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        let selection = editor.selection;
        // Maximise the selection to get the starting position of start line and ending position of end line.
        let selectionImproved = new vscode.Selection(
            editor.document.lineAt(selection.start.line).range.start,
            editor.document.lineAt(selection.end.line).range.end
        );
        let text = editor.document.getText(selectionImproved);

        console.log("Input text :\n" + text);

        // Split the lines of the selection.
        let lines = text.split("\n");

        // Find out the longest case match
        let maximumIndent = 0;
        lines.forEach((line) => {
            let indent = line.lastIndexOf("->");
            console.log("Indent : " + indent);
            if (indent > maximumIndent)
                maximumIndent = indent;
        });

        // Factor by tab size, so that maximumIndent becomes equal to a tab size.
        maximumIndent += 4 - maximumIndent%4;

        console.log("Maximum Indent : " + maximumIndent);

        let newlines = lines.map((line) => {
            let indent = line.lastIndexOf("->");
            // Replace each line with the maximum indent
            let newline = line.replace("->", " ".repeat(maximumIndent - indent) + "->");
            console.log("Line:\n" + line + "\n" + newline);
            return newline;
        });

        let newtext = newlines.join("\n");
        console.log("Output Text :\n" + newtext);
        editor.edit((editBuilder) => {
            // Finally replace the text with new text
            editBuilder.replace(selectionImproved, newtext);
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}