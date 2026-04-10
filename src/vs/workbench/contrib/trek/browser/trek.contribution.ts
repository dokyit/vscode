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
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { ITrekAuthBrokerService, TrekAuthBrokerService } from '../common/trekAuthBrokerService.js';
import { TrekAuthMethod, TrekProviderId } from '../common/trekAuthTypes.js';
import { getTrekAuthAdapter } from './trekAuthAdapterRegistry.js';
import { registerCopilotDeviceFlowAdapter } from './adapters/copilotDeviceFlowAdapter.js';

registerSingleton(ITrekAuthBrokerService, TrekAuthBrokerService, InstantiationType.Delayed);

const TREK_SESSION_STORAGE_KEY = 'trek.auth.sessions.v1';
let adaptersRegistered = false;

function ensureAdaptersRegistered(accessor: ServicesAccessor): void {
	if (adaptersRegistered) {
		return;
	}

	const quickInputService = accessor.get(IQuickInputService);
	registerCopilotDeviceFlowAdapter(quickInputService);
	adaptersRegistered = true;
}

function persistSessions(accessor: ServicesAccessor): void {
	const trekAuthBrokerService = accessor.get(ITrekAuthBrokerService);
	const storageService = accessor.get(IStorageService);

	storageService.store(
		TREK_SESSION_STORAGE_KEY,
		JSON.stringify(trekAuthBrokerService.listSessions()),
		StorageScope.PROFILE,
		StorageTarget.MACHINE
	);
}

function restoreSessions(accessor: ServicesAccessor): void {
	const trekAuthBrokerService = accessor.get(ITrekAuthBrokerService);
	const storageService = accessor.get(IStorageService);
	const raw = storageService.get(TREK_SESSION_STORAGE_KEY, StorageScope.PROFILE, '[]');

	let sessions: Array<{ providerId: TrekProviderId; method: string; accountLabel?: string }> = [];
	try {
		sessions = JSON.parse(raw);
	} catch {
		return;
	}

	for (const session of sessions) {
		if (typeof session.providerId !== 'string' || typeof session.method !== 'string') {
			continue;
		}
		if (!trekAuthBrokerService.isMethodSupported(session.providerId, session.method as TrekAuthMethod)) {
			continue;
		}
		trekAuthBrokerService.connect(session.providerId, session.method as TrekAuthMethod, session.accountLabel);
	}
}

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
		ensureAdaptersRegistered(accessor);
		restoreSessions(accessor);

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
		ensureAdaptersRegistered(accessor);

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
			}).then(async selectedMethod => {
				if (!selectedMethod) {
					return;
				}

				const selectedAuthMethod = selectedMethod.label as TrekAuthMethod;
				const adapter = getTrekAuthAdapter(providerId);
				if (!adapter || !adapter.methods.includes(selectedAuthMethod)) {
					void quickInputService.pick([
						{
							label: localize2('trek.auth.adapter.missing', 'No adapter available for selected provider/method'),
							description: `${providerId} via ${selectedAuthMethod}`,
							detail: localize2('trek.auth.adapter.missing.detail', 'Provider adapter not implemented yet in Trek IDE.')
						}
					], {
						title: localize2('trek.auth.adapter.missing.title', 'Trek Adapter Missing')
					});
					return;
				}

				const result = await adapter.connect({ providerId, method: selectedAuthMethod });
				const session = trekAuthBrokerService.connect(providerId, selectedAuthMethod, result.accountLabel);
				persistSessions(accessor);

				void quickInputService.pick([
					{
						label: localize2('trek.auth.connected', 'Connected'),
						description: `${session.providerId} via ${session.method}`,
						detail: result.entitlementLabel ?? session.entitlementLabel
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
		restoreSessions(accessor);

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

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'trek.auth.disconnectProvider',
			title: localize2('trek.auth.disconnectProvider', 'Trek: Disconnect Provider'),
			category: Categories.Developer,
			f1: true
		});
	}

	run(accessor: ServicesAccessor): void {
		restoreSessions(accessor);

		const trekAuthBrokerService = accessor.get(ITrekAuthBrokerService);
		const quickInputService = accessor.get(IQuickInputService);
		const sessions = trekAuthBrokerService.listSessions();

		if (sessions.length === 0) {
			void quickInputService.pick([
				{ label: localize2('trek.auth.disconnect.empty', 'No sessions to disconnect') }
			], {
				title: localize2('trek.auth.disconnect.title', 'Disconnect Trek Provider')
			});
			return;
		}

		void quickInputService.pick(sessions.map(session => ({
			label: session.providerId,
			description: session.method,
			detail: session.accountLabel
		})), {
			title: localize2('trek.auth.disconnect.pick', 'Select Provider Session to Disconnect')
		}).then(selected => {
			if (!selected) {
				return;
			}

			trekAuthBrokerService.disconnect(selected.label as TrekProviderId);
			persistSessions(accessor);

			void quickInputService.pick([
				{ label: localize2('trek.auth.disconnect.done', 'Disconnected'), description: selected.label }
			], {
				title: localize2('trek.auth.disconnect.done.title', 'Trek Provider Session Removed')
			});
		});
	}
});
