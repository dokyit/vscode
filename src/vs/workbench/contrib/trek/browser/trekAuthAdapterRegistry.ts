/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITrekAuthAdapter } from '../common/trekAuthAdapters.js';
import { TrekProviderId } from '../common/trekAuthTypes.js';

const adapters = new Map<TrekProviderId, ITrekAuthAdapter>();

export function registerTrekAuthAdapter(adapter: ITrekAuthAdapter): void {
	adapters.set(adapter.providerId, adapter);
}

export function getTrekAuthAdapter(providerId: TrekProviderId): ITrekAuthAdapter | undefined {
	return adapters.get(providerId);
}

export function listTrekAuthAdapters(): readonly ITrekAuthAdapter[] {
	return [...adapters.values()];
}
