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
import { TrekProviderId } from '../common/trekAuthTypes.js';

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

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'trek.auth.connectProvider',
			title: localize2('trek.auth.connectProvider', 'Trek: Connect Provider'),
			category: Categories.Developer,
			f1: true
		});
	}

	run(accessor: ServicesAccessor): void {
		const trekAuthBrokerService = accessor.get(ITrekAuthBrokerService);
		const quickInputService = accessor.get(IQuickInputService);

		const providers = trekAuthBrokerService.listCapabilities();
		const providerPicks = providers.map(provider => ({
			label: provider.displayName,
			description: provider.providerId,
			detail: provider.notes,
			providerId: provider.providerId
		}));

		void quickInputService.pick(providerPicks, {
			title: localize2('trek.auth.providers.pick', 'Select Trek Provider')
		}).then(selectedProvider => {
			if (!selectedProvider) {
				return;
			}

			const providerId = selectedProvider.providerId as TrekProviderId;
			const methods = trekAuthBrokerService.listSupportedMethods(providerId);

			if (methods.length === 0) {
				void quickInputService.pick([
					{
						label: localize2('trek.auth.providers.unsupported', 'No supported auth methods'),
						description: providerId,
						detail: localize2('trek.auth.providers.unsupported.detail', 'This provider is intentionally disabled until official third-party support is available.')
					}
				], {
					title: localize2('trek.auth.providers.unsupported.title', 'Provider Not Connectable')
				});
				return;
			}

			const methodPicks = methods.map(method => ({
				label: method,
				description: providerId
			}));

			void quickInputService.pick(methodPicks, {
				title: localize2('trek.auth.methods.pick', 'Select Auth Method')
			}).then(selectedMethod => {
				if (!selectedMethod) {
					return;
				}

				const session = trekAuthBrokerService.connect(providerId, selectedMethod.label as typeof methods[number], 'mock-account');
				void quickInputService.pick([
					{
						label: localize2('trek.auth.connected', 'Connected'),
						description: `${session.providerId} via ${session.method}`,
						detail: session.entitlementLabel
					}
				], {
					title: localize2('trek.auth.connected.title', 'Trek Provider Session Created')
				});
			});
		});
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'trek.auth.showSessions',
			title: localize2('trek.auth.showSessions', 'Trek: Show Provider Sessions'),
			category: Categories.Developer,
			f1: true
		});
	}

	run(accessor: ServicesAccessor): void {
		const trekAuthBrokerService = accessor.get(ITrekAuthBrokerService);
		const quickInputService = accessor.get(IQuickInputService);
		const sessions = trekAuthBrokerService.listSessions();

		if (sessions.length === 0) {
			void quickInputService.pick([
				{
					label: localize2('trek.auth.sessions.empty', 'No active Trek provider sessions')
				}
			], {
				title: localize2('trek.auth.sessions.title', 'Trek Provider Sessions')
			});
			return;
		}

		void quickInputService.pick(sessions.map(session => ({
			label: session.providerId,
			description: session.method,
			detail: `${session.accountLabel ?? 'account'} | ${session.entitlementLabel ?? 'entitlement unknown'}`
		})), {
			title: localize2('trek.auth.sessions.title', 'Trek Provider Sessions')
		});
	}
});
