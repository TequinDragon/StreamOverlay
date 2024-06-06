import { getAuthURI, updateAuthToken } from '$lib/server/twitch';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async (params) => {
	const code = params.url.searchParams.get('code');
	if (code != null) {
		updateAuthToken(code);
		redirect(307, '/');
	} else {
		redirect(307, getAuthURI());
	}
};
