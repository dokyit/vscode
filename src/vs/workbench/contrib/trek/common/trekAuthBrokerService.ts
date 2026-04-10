/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ITrekAuthBroker, ITrekProviderCapability, ITrekProviderSession, TrekAuthMethod, TrekProviderId } from './trekAuthTypes.js';

export const ITrekAuthBrokerService = createDecorator<ITrekAuthBrokerService>('trekAuthBrokerService');

export interface ITrekAuthBrokerService extends ITrekAuthBroker {
	readonly _serviceBrand: undefined;
}

const TREK_PROVIDER_CAPABILITIES: readonly ITrekProviderCapability[] = [
	{
		providerId: 'github-copilot',
		displayName: 'GitHub Copilot',
		methods: ['oauth_device'],
		notes: 'Uses GitHub device flow; model access depends on subscription entitlement.'
	},
	{
		providerId: 'openai-chatgpt',
		displayName: 'OpenAI / ChatGPT',
		methods: ['oauth_web', 'api_key'],
		notes: 'Account-based sign-in where supported, otherwise API key.'
	},
	{
		providerId: 'google-gemini',
		displayName: 'Google Gemini',
		methods: ['cloud_iam', 'api_key'],
		notes: 'Favor Vertex/Google Cloud credentials for production integrations.'
	},
	{
		providerId: 'anthropic-claude',
		displayName: 'Anthropic Claude',
		methods: ['api_key'],
		notes: 'Subscription-account routing is not enabled in Trek without explicit official support.'
	},
	{
		providerId: 't3-chat',
		displayName: 'T3 Chat',
		methods: [],
		notes: 'No direct provider auth flow enabled pending official third-party integration docs.'
	}
];

export class TrekAuthBrokerService implements ITrekAuthBrokerService {
	declare readonly _serviceBrand: undefined;

	private readonly sessions = new Map<TrekProviderId, ITrekProviderSession>();

	listCapabilities(): readonly ITrekProviderCapability[] {
		return TREK_PROVIDER_CAPABILITIES;
	}

	listSessions(): readonly ITrekProviderSession[] {
		return [...this.sessions.values()];
	}

	listSupportedMethods(providerId: TrekProviderId): readonly TrekAuthMethod[] {
		const capability = TREK_PROVIDER_CAPABILITIES.find(item => item.providerId === providerId);
		if (!capability) {
			return [];
		}

		return capability.methods;
	}

	isMethodSupported(providerId: TrekProviderId, method: TrekAuthMethod): boolean {
		const capability = TREK_PROVIDER_CAPABILITIES.find(item => item.providerId === providerId);
		if (!capability) {
			return false;
		}

		return capability.methods.includes(method);
	}

	connect(providerId: TrekProviderId, method: TrekAuthMethod, accountLabel?: string): ITrekProviderSession {
		if (!this.isMethodSupported(providerId, method)) {
			throw new Error(`Auth method ${method} is not supported for provider ${providerId}.`);
		}

		const now = Date.now();
		const session: ITrekProviderSession = {
			providerId,
			method,
			connected: true,
			accountLabel,
			updatedAt: now,
			entitlementLabel: this.computeEntitlementLabel(providerId)
		};

		this.sessions.set(providerId, session);
		return session;
	}

	disconnect(providerId: TrekProviderId): void {
		this.sessions.delete(providerId);
	}

	private computeEntitlementLabel(providerId: TrekProviderId): string {
		switch (providerId) {
			case 'github-copilot':
				return 'subscription required';
			case 'openai-chatgpt':
				return 'plan-dependent';
			case 'google-gemini':
				return 'cloud project entitlement';
			case 'anthropic-claude':
				return 'api account entitlement';
			default:
				return 'unknown';
		}
	}
}
