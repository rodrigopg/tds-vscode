import path = require("path");
import fse = require("fs-extra");
import {
  PROJECT_FOLDER,
  RPO_FOLDER,
  RPO_RESET_TARGET,
  RPO_RESET_SOURCE,
  RPO_CUSTOM,
} from "./scenario";
import {
  By,
  VSBrowser,
  InputBox,
  WebElement,
  QuickPickItem,
  ContextMenu,
  ViewItem,
  ViewControl,
  EditorView,
  TreeItem,
} from "vscode-extension-tester";
import { expect } from "chai";
import { IUserData } from "./page-objects/interface-po";
import { setTimeout } from "timers/promises";

export const DEFAULT_DELAY = 1000;
export const DELAY_SHORT = DEFAULT_DELAY * 2;
export const DELAY_MEDIUM = DEFAULT_DELAY * 3;
export const DELAY_LONG = DEFAULT_DELAY * 5;

function clearVscodeFiles(projectFolder: string): void {
  const serversJsonFile: string = path.join(
    projectFolder,
    ".vscode",
    "servers.json"
  );

  fse.ensureDirSync(path.dirname(serversJsonFile));

  if (fse.existsSync(serversJsonFile)) {
    fse.removeSync(serversJsonFile);
  }

  const launchJsonFile: string = path.join(
    projectFolder,
    ".vscode",
    "launch.json"
  );
  fse.ensureDirSync(path.dirname(serversJsonFile));

  if (fse.existsSync(launchJsonFile)) {
    fse.removeSync(launchJsonFile);
  }

  const launch: any = {
    version: "0.2.0",
    configurations: [{}],
  };
  fse.writeJSONSync(launchJsonFile, launch);
}

async function closeAllEditors(): Promise<void> {
  const editorView: EditorView = new EditorView();
  await editorView.closeAllEditors();

  await delay();
}

export interface IOpenProject {
  linter: boolean;
  resetRpo: boolean;
  resetRpoCustom: boolean;
}

const DEFAULT_OPEN_PROJECT: IOpenProject = {
  linter: false,
  resetRpo: false,
  resetRpoCustom: true,
};

export async function openProjectWithReset() {
  openProject({ resetRpo: true, resetRpoCustom: true });
}

export async function openProject(
  optionsOpenProject: Partial<IOpenProject> = {}
): Promise<void> {
  const options: IOpenProject = {
    ...DEFAULT_OPEN_PROJECT,
    ...optionsOpenProject,
  };

  clearVscodeFiles(PROJECT_FOLDER);

  if (options.resetRpo) {
    resetRpo();
  }
  if (options.resetRpoCustom) {
    resetRpoCustom();
  }

  await VSBrowser.instance.openResources(PROJECT_FOLDER);

  await delay(DEFAULT_DELAY);

  //const settingsPO: SettingsPageObject = new SettingsPageObject();
  //await settingsPO.openView();
  //await settingsPO.setLinter(options.linter);

  await closeAllEditors();

  await delay(DELAY_MEDIUM);
}

function resetRpo() {
  fse.copyFileSync(
    path.join(RPO_FOLDER, RPO_RESET_SOURCE),
    path.join(RPO_FOLDER, RPO_RESET_TARGET)
  );
}

function resetRpoCustom() {
  if (fse.existsSync(RPO_CUSTOM)) {
    fse.removeSync(RPO_CUSTOM);
  }
}

export async function readServersJsonFile(): Promise<string> {
  const serversJsonFile: string = path.join(
    PROJECT_FOLDER,
    ".vscode",
    "servers.json"
  );
  let result: string = "< file not found >";

  fse.ensureDirSync(path.dirname(serversJsonFile));

  if (fse.existsSync(serversJsonFile)) {
    const buffer: Buffer = fse.readFileSync(serversJsonFile);
    result = buffer.toString();
  }

  return result;
}

export const delay = async (duration: number = DEFAULT_DELAY) => {
  await setTimeout(duration);
  //  const driver = VSBrowser.instance.driver;
  //  await driver.wait(() => {
  //    return Promise.resolve(() => true);
  // }, duration);
};

export const avoidsBacksliding = async () => {
  await delay(DELAY_MEDIUM);
};

export async function takeQuickPickAction(
  pickBox: InputBox,
  titleAction: string
): Promise<boolean> {
  const actionContainer: WebElement = pickBox.findElement(
    By.className("actions-container")
  );
  const actionList: WebElement[] = await actionContainer.findElements(
    By.className("action-item")
  );
  const actions: WebElement[] = actionList.filter(
    async (action: WebElement) => {
      const link: WebElement = await action.findElement(
        By.css("a.action-label")
      );
      const title: string = (await link.getAttribute("title")).toLowerCase();
      return title === titleAction.toLowerCase();
    }
  );

  if (actions.length == 1) {
    await actions[0].click();
    await delay();
    return true;
  }

  return false;
}

export async function fillEnvironment(environment: string) {
  const pickBox = new InputBox();
  await delay();

  let title = await pickBox.getTitle();
  expect(title).is.equal("Connection (1/1)");

  const quickPicks: QuickPickItem[] = await pickBox.getQuickPicks();
  const find: boolean =
    quickPicks.filter(async (element: QuickPickItem) => {
      return (await element.getText()) == environment;
    }).length > 0;

  if (!find) {
    expect(await takeQuickPickAction(pickBox, "action")).is.true;
    title = await pickBox.getMessage();
    expect(title.startsWith("Enter the name of the environment")).is.true;
    await delay();
  }

  await pickBox.setText(environment);
  await delay();

  await pickBox.confirm();
  await delay();
}

export async function fillUserdata(userData: IUserData) {
  const pickBox = new InputBox();
  await delay();
  pickBox.wait();

  let title = await pickBox.getTitle();
  expect(title).is.equal("Authentication (1/2)");

  await pickBox.setText(userData.username);
  await delay();
  await pickBox.confirm();
  await delay();

  await pickBox.wait();
  title = await pickBox.getTitle();
  expect(title).is.equal("Authentication (2/2)");

  await pickBox.setText(userData.password);
  await delay();
  await pickBox.confirm();
  await delay();
}

export async function fillDebugConfig(title: string) {
  const pickBox = new InputBox();
  await delay();
  pickBox.wait();

  await pickBox.setText(title);
  await delay();
  await pickBox.confirm();
  await delay();
}

export async function fireContextMenuAction(
  element: ViewItem | ViewControl,
  name: string
) {
  const menu: ContextMenu = await element.openContextMenu();
  await menu.select(name);
  await delay();
}

