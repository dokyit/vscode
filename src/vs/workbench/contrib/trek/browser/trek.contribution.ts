/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ITrekAuthBrokerService, TrekAuthBrokerService } from '../common/trekAuthBrokerService.js';

registerSingleton(ITrekAuthBrokerService, TrekAuthBrokerService, InstantiationType.Delayed);

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'trek.auth.showProviderCapabilities',
			title: localize2('trek.auth.showProviderCapabilities', 'Trek: Show Provider Auth Capabilities'),
			category: Categories.Developer,
			f1: true
		});
	}

	run(accessor: ServicesAccessor): void {
		const trekAuthBrokerService = accessor.get(ITrekAuthBrokerService);
		const quickInputService = accessor.get(IQuickInputService);

		const capabilities = trekAuthBrokerService.listCapabilities();
		const picks = capabilities.map(capability => {
			const methods = capability.methods.length > 0 ? capability.methods.join(', ') : 'unsupported';
			return {
				label: capability.displayName,
				description: methods,
				detail: capability.notes
			};
		});

		void quickInputService.pick(picks, {
			title: localize2('trek.auth.providers.title', 'Trek IDE Provider Auth Capabilities')
		});
	}
});
