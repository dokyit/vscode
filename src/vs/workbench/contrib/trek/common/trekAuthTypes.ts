/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export const TrekProviderIds = [
	'github-copilot',
	'openai-chatgpt',
	'google-gemini',
	'anthropic-claude',
	't3-chat'
] as const;

export type TrekProviderId = (typeof TrekProviderIds)[number];

export const TrekAuthMethods = [
	'api_key',
	'oauth_device',
	'oauth_web',
	'cloud_iam'
] as const;

export type TrekAuthMethod = (typeof TrekAuthMethods)[number];

export interface ITrekProviderCapability {
	readonly providerId: TrekProviderId;
	readonly displayName: string;
	readonly methods: readonly TrekAuthMethod[];
	readonly notes?: string;
}

export interface ITrekProviderSession {
	readonly providerId: TrekProviderId;
	readonly method: TrekAuthMethod;
	readonly connected: boolean;
	readonly accountLabel?: string;
	readonly entitlementLabel?: string;
	readonly updatedAt: number;
}

export interface ITrekAuthBroker {
	readonly _serviceBrand: undefined;

	listCapabilities(): readonly ITrekProviderCapability[];
	listSessions(): readonly ITrekProviderSession[];
	isMethodSupported(providerId: TrekProviderId, method: TrekAuthMethod): boolean;
}
