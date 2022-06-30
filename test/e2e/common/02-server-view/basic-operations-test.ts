import { expect } from "chai";
import { describe, before, it } from "mocha";
import { TreeItem } from "vscode-extension-tester";
import {
  delay,
  DEFAULT_DELAY,
  fillEnvironment,
  fillUserdata,
  openProject,
} from "../../helper";
import { ServerPageObject } from "../../page-objects/server-po";
import { ServerTreeItemPageObject } from "../../page-objects/server-tree-item-po";
import { ServerViewPageObject } from "../../page-objects/server-view-po";
import { WorkbenchPageObject } from "../../page-objects/workbench-po";
import { ADMIN_USER_DATA, DELETE_DATA, APPSERVER_DATA } from "../../scenario";

describe("Server View Basic Operations", async () => {
  let serverTreePO: ServerViewPageObject;
  let serverItemPO: ServerTreeItemPageObject;
  let workbenchPO: WorkbenchPageObject;

  before(async () => {
    await openProject();

    workbenchPO = new WorkbenchPageObject();
    serverTreePO = await workbenchPO.openTotvsView();

    serverItemPO = new ServerTreeItemPageObject(
      await serverTreePO.getServer(APPSERVER_DATA)
    );

    await delay();
  });

  it("No Server Connected", async () => {
    expect(await workbenchPO.isNeedSelectServer()).is.true;
  });

  it("isSelected Node", async () => {
    await serverItemPO.select();

    expect(await serverItemPO.isSelected()).is.true;
  });

  it("Fire Connect Action", async () => {
    await serverItemPO.fireConnectAction();
    await workbenchPO.waitValidatingServer();
  });

  it("Connection Process", async () => {
      await fillEnvironment(APPSERVER_DATA.environment);
      await delay();
      await fillUserdata(ADMIN_USER_DATA);
      await delay();

      await workbenchPO.waitAuthenticating();
  })

  it("Localhost Server Connected", async () => {

    expect(
      await workbenchPO.isConnected(
        APPSERVER_DATA.serverName,
        APPSERVER_DATA.environment
      ), "Status bar"
    ).is.true;

    expect(await serverItemPO.isConnected(), "Treeviw node").is.true;
  });

  it("Localhost Server Disconnected", async () => {
    await serverItemPO.fireDisconnectAction();

    expect(await workbenchPO.isNeedSelectServer()).is.true;
    expect(await serverItemPO.isNotConnected()).is.true;
  });

  it("Reconnect", async () => {
    //esta com erro de driver
    await serverItemPO.fireReconnectAction();
    await fillEnvironment(APPSERVER_DATA.environment);
    await workbenchPO.waitReconnection();

    expect(
      await workbenchPO.isConnected(
        APPSERVER_DATA.serverName,
        APPSERVER_DATA.environment
      )
    ).is.true;
    expect(await serverItemPO.isConnected()).is.true;
  });

  // o server não valida o ambiente na conexão . gera RPO vazio.
  it.skip("Try Connect Using Invalid Environment", async () => {
    await serverItemPO.fireDisconnectAction();

    serverItemPO = await serverTreePO.connect(
      APPSERVER_DATA.serverName,
      "p12_invalid",
      undefined,
      false
    );

    await delay();
    expect(await workbenchPO.isNeedSelectServer()).is.true;
  });

  it("Add server (context menu)", async () => {
    await serverItemPO.fireAddServerAction();

    const serverPO = new ServerPageObject();
    await serverPO.fillServerPage(DELETE_DATA);
    await serverPO.fireSaveClose();

    await delay();

    expect(await workbenchPO.isSavedServer()).is.true;
  });
});
