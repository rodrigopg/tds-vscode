import { expect } from "chai";
import { describe, before, it } from "mocha";
import { delay, openProject } from "../../helper";
import { FunctionsInspectorPageObject } from "../../page-objects/functions-inspector-po";
import { ObjectsInspectorPageObject } from "../../page-objects/objects-inspector-po";
import { RepositoryLogPageObject } from "../../page-objects/repository-log-po";
import { ServerTreeItemPageObject } from "../../page-objects/server-tree-item-po";
import { ServerViewPageObject } from "../../page-objects/server-view-po";
import { WorkbenchPageObject } from "../../page-objects/workbench-po";
import { ADMIN_USER_DATA, APPSERVER_DATA } from "../../scenario";

describe("RPO Operations", async () => {
  let workbenchPO: WorkbenchPageObject;
  let serverTreePO: ServerViewPageObject;
  let serverItemPO: ServerTreeItemPageObject;

  before(async () => {
    await openProject();

    workbenchPO = new WorkbenchPageObject();
    serverTreePO = await workbenchPO.openTotvsView();

    await serverTreePO.getServer(APPSERVER_DATA);
  });

  beforeEach(async () => {
    serverItemPO = await serverTreePO.connect(
      APPSERVER_DATA.serverName,
      APPSERVER_DATA.environment,
      ADMIN_USER_DATA
    );
  });

  afterEach(async () => {
    await serverItemPO.fireDisconnectAction();
    await delay();
  });

  it("Check Integrity", async () => {
    await serverItemPO.fireCheckIntegrity();

    await workbenchPO.waitCheckIntegrity();
    await delay();

    expect(await workbenchPO.isRpoIntactOrIncomplete()).is.true;
  });

  it("Repository Log", async () => {
    // testa apenas a abertura do diálogo
    await serverItemPO.fireRepositoryLog();

    const repositoryLogPO: RepositoryLogPageObject =
      new RepositoryLogPageObject();

    expect(await repositoryLogPO.isOpen()).is.true;

    await repositoryLogPO.close();
  });

  it("Objects Inspector", async () => {
    // testa apenas a abertura do diálogo
    await serverItemPO.fireObjectsInspector();

    const objectInspectorPO: ObjectsInspectorPageObject =
      new ObjectsInspectorPageObject();

    expect(await objectInspectorPO.isOpen()).is.true;

    await objectInspectorPO.close();
  });

  it("Functions Inspector", async () => {
    // testa apenas a abertura do diálogo
    await serverItemPO.fireFunctionsInspector();

    const functionsInspectorPO: FunctionsInspectorPageObject =
      new FunctionsInspectorPageObject();

    expect(await functionsInspectorPO.isOpen()).is.true;

    await functionsInspectorPO.close();
  });
});
