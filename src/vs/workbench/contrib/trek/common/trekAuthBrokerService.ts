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

	private readonly sessions: ITrekProviderSession[] = [];

	listCapabilities(): readonly ITrekProviderCapability[] {
		return TREK_PROVIDER_CAPABILITIES;
	}

	listSessions(): readonly ITrekProviderSession[] {
		return this.sessions;
	}

	isMethodSupported(providerId: TrekProviderId, method: TrekAuthMethod): boolean {
		const capability = TREK_PROVIDER_CAPABILITIES.find(item => item.providerId === providerId);
		if (!capability) {
			return false;
		}

		return capability.methods.includes(method);
	}
}
