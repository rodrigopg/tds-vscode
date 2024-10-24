import { expect } from "chai";
import { describe, before, it } from "mocha";
import { delay, prepareProject } from "../../helper";
import { WorkbenchPageObject } from "../../page-objects/workbench-po";
import { ADMIN_USER_DATA, APPSERVER_DATA } from "../../scenario";
import { DebugToolbar, TreeItem } from "vscode-extension-tester";
import { DebugPageObject } from "../../page-objects/debug-view-po";
import { ServerViewPageObject } from "../../page-objects/server-view-po";
import { BuildPageObject } from "../../page-objects/build-po";
import { ExplorerPageObject } from "../../page-objects/explorer-view-po";
import { TextEditorPageObject } from "../../page-objects/text-editor-po";
import { ServerTreeItemPageObject } from "../../page-objects/server-tree-item-po";

const COMPILE_FILE: string[] = ["files", "singleFile", "escolheNum.prw"];
const LAUNCHER_NAME: string = "Smart Client Debug";

describe("Debug stop", async () => {
  let workbenchPO: WorkbenchPageObject;
  let debugPO: DebugPageObject;
  let debugBar: DebugToolbar;
  let serverTreePO: ServerViewPageObject;
  let serverItemTreePO: ServerTreeItemPageObject;
  let editor: TextEditorPageObject;

  before(async () => {
    await prepareProject();

    workbenchPO = new WorkbenchPageObject();

    debugPO = await workbenchPO.openDebugView();
    await debugPO.registerLauncher(
      "totvs_language_debug",
      LAUNCHER_NAME,
      APPSERVER_DATA.smartClientBin
    );

    serverTreePO = await workbenchPO.openTotvsView();
    await serverTreePO.getServer(APPSERVER_DATA);
    await delay();

    serverItemTreePO = await serverTreePO.connect(
      APPSERVER_DATA.serverName,
      APPSERVER_DATA.environment,
      ADMIN_USER_DATA
    );
  });

  after(async () => {
    await serverTreePO.openView();
    await serverItemTreePO.fireDisconnectAction();
    await workbenchPO.closeAllEditors();
  });

  it("Prepare source to debug", async () => {
    const explorerPO: ExplorerPageObject = await workbenchPO.openExplorerView();
    const compilePO: BuildPageObject = new BuildPageObject(workbenchPO);
    const resourceItem: TreeItem = await explorerPO.getResource(COMPILE_FILE);

    await resourceItem.click();
    await compilePO.fireBuildFile(resourceItem);
    await workbenchPO.waitBuilding();
  });

  it("Set breakpoint", async () => {
    editor = await debugPO.getEditorSource(
      COMPILE_FILE[COMPILE_FILE.length - 1]
    );

    await debugPO.openView();
    await debugPO.clearAllBreakpoints();

    const result = await editor.setBreakpoint(10);
    expect(result, "Breakpoint not set (line 10)").is.true;
  });

  it("Start debugger", async () => {
    await debugPO.openView();
    await debugPO.selectLaunchConfiguration(LAUNCHER_NAME);
    await debugPO.start();

    await debugPO.fillProgramName("u_escolhenum");

    expect(await workbenchPO.isDABeginProcess(), "DA not running").is.true;

    debugBar = await DebugToolbar.create();
    await debugBar.waitForBreakPoint();
  });

  it("Stop debugger", async () => {
    await debugBar.stop();
    await workbenchPO.waitStopDebugger();

    expect(await workbenchPO.isDAEndProcess(), "Debugger not stopped correctly")
      .is.true;
  });
});
