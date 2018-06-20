'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import { isArray } from 'util';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "me" is now active!');

    let format = (sep: string, search: (s: string, m: number) => number) => {
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
            let indent = search(line, 0);
            console.log("Indent : " + indent);
            if (indent > maximumIndent)
                maximumIndent = indent;
        });

        // Factor by tab size, so that maximumIndent becomes equal to a tab size.
        maximumIndent += 4 - maximumIndent%4;

        console.log("Maximum Indent : " + maximumIndent);

        let newlines = lines.map((line) => {
            let indent = search(line, 1);
            // 2 Cases:
            // 1. Maximum Indent to be applied is larger than all current indents
            // 2. Maximum Indent to be applied is smaller than some current indents

            let newline = "";
            if (maximumIndent >= indent) {
                // Case 1
                // Replace each line with the maximum indent
                newline = line.slice(0, indent) + " ".repeat(maximumIndent - indent) + line.slice(indent);
                // line.replace(sep, " ".repeat(maximumIndent - indent) + sep);
            }
            else {
                // Case 2
                // Remove the unnecessary indent
                newline = line.slice(0, maximumIndent) + line.slice(indent);
            }
            console.log("Line:\n" + line + "\n" + newline);
            return newline;
        });

        let newtext = newlines.join("\n");
        console.log("Output Text :\n" + newtext);
        editor.edit((editBuilder) => {
            // Finally replace the text with new text
            editBuilder.replace(selectionImproved, newtext);
        });
    };

    let simpleSearch = (sep: string) => {
        return (line: string, mode: number) => {
            let indent = line.lastIndexOf(sep);
            // There might already be some formatting, that should be ignored.
            while(mode === 0 && line[indent-1] === " ")
                indent--;
            return indent;
        };
    };

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let formatCase = vscode.commands.registerCommand('extension.formatCase', () => {
        format("->", simpleSearch("->"));
    });

    let formatGuard = vscode.commands.registerCommand('extension.formatGuard', () => {
        format("=", (line: string, mode: number) => {
            let indent = line.indexOf("=");
            while (line[indent+1] === "=") {
                indent = line.indexOf("=", indent+2);
            }
            // There might already be some formatting, that should be ignored.
            while(mode === 0 && line[indent-1] === " ")
                indent--;
            return indent;
        });
    });

    let formatDocs = vscode.commands.registerCommand('extension.formatDocs', () => {
        format("--", simpleSearch("--"));
    });

    let formatData = vscode.commands.registerCommand('extension.formatData', () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }
        let data = editor.document.getText();
        
        let newData = JSON.stringify(parseList(data, 0).value, null, 4);
        console.log(newData);
        let lastLine = editor.document.lineAt(editor.document.lineCount - 1);
        editor.edit((editBuilder) => {
            if (!editor) {
                return ;
            }
            // Finally replace the text with new text
            editBuilder.replace(
                new vscode.Range(
                    new vscode.Position(0, 0),
                    new vscode.Position(
                        editor.document.lineCount - 1,
                        lastLine.range.end.character
                    )
                ),
                newData.replace(/\"/g, ''));
        });
        // showData(parseList(data, 0).value);
    });

    class ParseData {
        value: Object
        index: number
        constructor(val: Object, i: number) {
            this.value = val;
            this.index = i;
        }
    };
    // let showData = (data: Object) : string => {
    //     let str = '[\n';
    //     for (let i=0; i<data.length; ++i) {
    //         if (isArray(data[i])) {
    //             str += showData(data[i]) + '\n';
    //         }
    //         else {
    //             str += data[i] + '\n';
    //         }
    //     }
    //     str += '\n]';
    // };

    let parseList = (data: string, begin: number) : ParseData => {
        if (data[begin+1] === ']')
            return new ParseData([], begin+2);
        else {
            let items = [], i=begin, val;
            while(data[i] !== ']'){
                val = parseItem(data, i+1);
                items.push(val.value);
                i = val.index;
            }
            return new ParseData(items, i+1);
        }
    };

    let parseItem = (data: string, i: number) : ParseData => {
        if (data[i] === '[') {
            return parseList(data, i);
        }
        else {
            let j = i;
            while(data[j] !== ']' && data[j] !== ',') {
                if (data[j] === '(') {
                    j = parseBracket(data, j).index;
                }
                ++j;
            }
            return new ParseData(data.substring(i, j), j);
        }
    };

    let parseBracket = (data: string, i: number) : ParseData => {
        if (data[i+1] === ')') {
            return new ParseData("", i+1);
        }
        else {
            let j = i+1;
            while (data[j] !== ')') {
                if (data[j] === '(')
                    j = parseBracket(data, j).index;
                ++j;
            }
            return new ParseData("", j);
        }
    };
    context.subscriptions.push(formatCase);
    context.subscriptions.push(formatGuard);
    context.subscriptions.push(formatDocs);
    context.subscriptions.push(formatData);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
