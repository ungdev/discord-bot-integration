const axios = require('axios');
const httpBuildQuery = require('http-build-query');

// Function to call the integration API and list each students in the website
export async function callApi(teamId: number | null = null) {
    var data = (globalThis as any).data;
	if (data.bearer === null || (data.bearer.expires_at !== undefined && data.bearer.expires_at < Date.now()) || (data.bearer.access_token !== undefined && data.bearer.access_token === null)) {
		const requestToken = await axios.post(
			`${process.env.ETU_BASE_URL}/api/oauth/token?${httpBuildQuery({
				grant_type: 'client_credentials',
				scopes: 'public',
				client_id: process.env.SITE_ETU_CLIENT_ID,
				client_secret: process.env.SITE_ETU_CLIENT_SECRET,
			})}`,
		);

		const response = await axios.post(
			`${process.env.INTE_BASE_URL}/api/oauth/discord/callback?${httpBuildQuery({
				access_token: requestToken.data.access_token.toString(),
			})}`,
		);
		data.bearer = response.data;
		data.bearerConfig = {
			headers: { Authorization: `Bearer ${data.bearer.access_token}` },
		};
	}

	if (data.factions === null || data.factions.length === 0) {
		data.factions = (await axios.get(`${process.env.INTE_BASE_URL}/api/factions`, data.bearerConfig)).data;
	}

	if (data.teams === null || data.teams.length === 0) {
		data.teams = (await axios.get(`${process.env.INTE_BASE_URL}/api/team`, data.bearerConfig)).data;
	}

	if (teamId === null) {
		const request = await axios.get(`${process.env.INTE_BASE_URL}/api/student`, data.bearerConfig);
		return request.data;
	}

	const team = await axios.get(`${process.env.INTE_BASE_URL}/api/team/${teamId}`, data.bearerConfig);
	team.data.faction_name = data.factions.filter((f: any) => f.id === team.data.faction_id)[0].name;

	return team.data;
}