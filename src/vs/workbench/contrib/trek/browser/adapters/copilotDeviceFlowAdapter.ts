/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../nls.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { ITrekAuthAdapter, ITrekAuthConnectRequest, ITrekAuthConnectResult } from '../../common/trekAuthAdapters.js';
import { TrekAuthMethod } from '../../common/trekAuthTypes.js';
import { registerTrekAuthAdapter } from '../trekAuthAdapterRegistry.js';

class CopilotDeviceFlowAdapter implements ITrekAuthAdapter {
	readonly providerId = 'github-copilot' as const;
	readonly methods: readonly TrekAuthMethod[] = ['oauth_device'];

	constructor(
		private readonly quickInputService: IQuickInputService
	) { }

	async connect(request: ITrekAuthConnectRequest): Promise<ITrekAuthConnectResult> {
		if (request.method !== 'oauth_device') {
			throw new Error(`Unsupported auth method for ${this.providerId}: ${request.method}`);
		}

		await this.quickInputService.pick([
			{
				label: localize('trek.copilot.deviceFlow.prompt', 'Device flow adapter scaffold active'),
				description: localize('trek.copilot.deviceFlow.description', 'Real GitHub OAuth/device integration will be wired in next phase.'),
				detail: localize('trek.copilot.deviceFlow.detail', 'This confirms adapter routing from Trek connect flow into provider-specific handler.')
			}
		], {
			title: localize('trek.copilot.deviceFlow.title', 'Trek Copilot Device Flow (Scaffold)')
		});

		return {
			accountLabel: 'copilot-device-flow-pending',
			entitlementLabel: 'subscription required'
		};
	}
}

export function registerCopilotDeviceFlowAdapter(quickInputService: IQuickInputService): void {
	registerTrekAuthAdapter(new CopilotDeviceFlowAdapter(quickInputService));
}
