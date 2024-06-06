import type { PageServerLoad } from './$types';
import { getAuthToken } from '$lib/server/twitch';

export const load: PageServerLoad = async (params) => {
	getAuthToken();
};
