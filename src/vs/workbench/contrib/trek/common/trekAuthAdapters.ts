/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TrekAuthMethod, TrekProviderId } from './trekAuthTypes.js';

export interface ITrekAuthConnectRequest {
	readonly providerId: TrekProviderId;
	readonly method: TrekAuthMethod;
}

export interface ITrekAuthConnectResult {
	readonly accountLabel: string;
	readonly entitlementLabel?: string;
}

export interface ITrekAuthAdapter {
	readonly providerId: TrekProviderId;
	readonly methods: readonly TrekAuthMethod[];

	connect(request: ITrekAuthConnectRequest): Promise<ITrekAuthConnectResult>;
}
