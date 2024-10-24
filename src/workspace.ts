import * as vscode from "vscode";
import { sendDidChangeConfiguration } from "./protocolMessages";
import { confirmRestartNow, getModifiedLanguageServerSettings } from "./server/languageServerSettings";
import { updateStatusBarItems } from "./statusBar";

function updateOpenEditors() {
	vscode.window.visibleTextEditors.forEach((element: vscode.TextEditor) => {
		if ((!element.document.isUntitled) &&
			((element.document.languageId == "advpl") || (element.document.languageId == "4gl"))) {
			//TODO: UI ficou ruim, ver como efetuar refresh só do editor
			vscode.commands.executeCommand("workbench.action.reloadWindow");
		}
	});
}

export function registerWorkspace(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
			if (e.affectsConfiguration("totvsLanguageServer")) {
				const settings: any[] = getModifiedLanguageServerSettings();
				if (settings.length > 0) {
					sendDidChangeConfiguration(settings).then(() => {
						updateStatusBarItems();
					});
				}
				if (!confirmRestartNow()) {
					updateOpenEditors();
				};
			}
		}),
		// vscode.workspace.onDidChangeWorkspaceFolders((event: vscode.WorkspaceFoldersChangeEvent) => {
		// 	console.dir(event);
		// }),
		// vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
		// 	console.dir(event);
		// }),
		// vscode.workspace.onDidCreateFiles((event: vscode.FileCreateEvent) => {
		// 	console.dir(event);
		// }),
		// vscode.workspace.onDidDeleteFiles((event: vscode.FileDeleteEvent) => {
		// 	console.dir(event);
		// })
	);

	// Send $advpl/textDocumentDidView. Always send a notification - this will
	// result in some extra work, but it shouldn't be a problem in practice.
	// TODO: O LS não faz nada. Desativado por enquanto.
	// (() => {
	//   window.onDidChangeVisibleTextEditors((visible) => {
	//     for (let editor of visible) {
	//       languageClient.sendNotification("$advpl/textDocumentDidView", {
	//         textDocumentUri: editor.document.uri.toString(),
	//       });
	//     }
	//   });
	// })();

	// const fsw = vscode.workspace.createFileSystemWatcher("**");
	// context.subscriptions.push(fsw);
	// fsw.onDidChange((e: vscode.Uri) => { console.dir(e) });
	// fsw.onDidCreate((e: vscode.Uri) => { console.dir(e) });
	// fsw.onDidDelete((e: vscode.Uri) => { console.dir(e) });
}