import { Key } from "vscode-extension-tester";
import { AbstractPageObject } from "./abstract-po";
import { ICompileKeyData, IIncludeData } from "./interface-po";

export class CompileKeyPageObject extends AbstractPageObject {
  async fillCompileKeyPage(data: ICompileKeyData) {
    await this.beginWebView();

    await this.setValue("compileKeyFile", `${data.compileKeyFile}${Key.TAB}`); // força saida do campo

    await this.endWebView();
  }

  async getCompileKeyPage(close: boolean = false): Promise<ICompileKeyData> {
    const result: ICompileKeyData = {
      machineId: "",
      compileKeyFile: "",
      key: "",
      generatedIn: "",
      expireIn: "",
      token: "",
      overwrite: "",
    };
    await this.beginWebView();

    result.machineId = await this.getValue("MachineID");
    result.compileKeyFile = await this.getValue("compileKeyFile");
    result.key = await this.getValue("KeyID");
    result.generatedIn = await this.getValue("GeneratedInID");
    result.expireIn = await this.getValue("ExpireInID");
    result.token = await this.getValue("TokenID");
    result.overwrite = await this.getValue("OverwriteID");

    if (close) {
      await this.click("submitCloseID");
    }

    await this.endWebView();
    return result;
  }

  async isValidKey(): Promise<boolean> {
    await this.beginWebView();

    const message: string = await this.getValue("OutputMessage");

    await this.endWebView();

    return message === "Key successfully validated";
  }

  async fireClear(): Promise<void> {
    await this.beginWebView();

    await this.click("cleanID");

    await this.endWebView();
  }

  async fireSave(close: boolean): Promise<void> {
    await this.beginWebView();

    await this.click(close ? "submitCloseID" : "submitID");

    await this.endWebView();
  }
}
