import * as nls from "vscode-nls";
import Utils from "./utils";
import { MultiStepInput } from "./multiStepInput";
import { authenticate } from "./serversView";
import { ServerItem } from "./serverItemProvider";

//import * as nls from 'vscode-nls';
//let localize = nls.loadMessageBundle();

/**
 * Coleta os dados necessarios para logar a um servidor advpl/4gl.
 *
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 *
 *
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
const localize = nls.loadMessageBundle();

export async function inputAuthenticationParameters(serverItem: ServerItem, environment: string) {

	//const VALIDADE_TIME_OUT = 1000;
	const title = localize("AUTHENTICATION", 'Authentication');

	let AUTH_TOTAL_STEPS = 2;
	let AUTH_USERNAME_STEP = 1;
	let AUTH_PASSWORD_STEP = 2;

	const serversConfig = Utils.getServersConfig();

	interface State {
		title: string;
		step: number;
		totalSteps: number;
		username: string;
		password: string;
	}

	async function collectAuthenticationInputs() {
		const state = {} as Partial<State>;

		let target = Utils.getServerById(serverItem.id, serversConfig);
		if (target) {
			state.username = target.username;
		}
		await MultiStepInput.run(input => inputUsername(input, state, serversConfig));

		return state as State;
	}

	async function inputUsername(input: MultiStepInput, state: Partial<State>, serversConfig: any) {
		state.username = await input.showInputBox({
			title: title,
			step: AUTH_USERNAME_STEP,
			totalSteps: AUTH_TOTAL_STEPS,
			value: state.username || '',
			prompt: localize("USER_IDENTIFICATION", 'User identification'),
			validate: validateRequiredValue,
			shouldResume: shouldResume,
			password: false
		});

		return (input: MultiStepInput) => inputPassword(input, state, serversConfig);
	}

	async function inputPassword(input: MultiStepInput, state: Partial<State>, serversConfig: any) {
		state.password = await input.showInputBox({
			title: title,
			step: AUTH_PASSWORD_STEP,
			totalSteps: AUTH_TOTAL_STEPS,
			value: state.password || '',
			prompt: localize("ACCESS PASSWORD", 'Access password'),
			validate: allTrueValue,
			shouldResume: shouldResume,
			password: true
		});
	}

	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			return false;
		});
	}

	async function allTrueValue(value: string) {
		// ...validate...
		//await new Promise(resolve => setTimeout(resolve, VALIDADE_TIME_OUT));

		return undefined;
	}

	async function validateRequiredValue(value: string) {
		// ...validate...
		//Nao esta claro o motivo desse timeout, pois o resolve nunca é passado e sempre é esperado o total do timeout antes de continuar
		//await new Promise(resolve => setTimeout(resolve, VALIDADE_TIME_OUT));
		return value === '' ? localize('REQUIRED_INFORMATION', 'Required information') : undefined;
	}

	async function main() {
		const authState = await collectAuthenticationInputs();
		authenticate(serverItem, environment, authState.username, authState.password);
	}

	main();
}
