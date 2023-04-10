const axios = require('axios');
const httpBuildQuery = require('http-build-query');

// Function to call the integration API and list each students in the website
export async function callApi(teamId: number | null = null) {
    if (
        global.data.bearer === null ||
        (global.data.bearer.expires_at !== undefined && global.data.bearer.expires_at < Date.now()) ||
        (global.data.bearer.access_token !== undefined && global.data.bearer.access_token === null)
    ) {
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
        global.data.bearer = response.data;
        global.data.bearerConfig = {
            headers: { Authorization: `Bearer ${global.data.bearer.access_token}` },
        };
    }

    if (global.data.factions === null || global.data.factions.length === 0) {
        global.data.factions = (
            await axios.get(`${process.env.INTE_BASE_URL}/api/factions`, global.data.bearerConfig)
        ).data;
    }

    if (global.data.teams === null || global.data.teams.length === 0) {
        global.data.teams = (await axios.get(`${process.env.INTE_BASE_URL}/api/team`, global.data.bearerConfig)).data;
    }

    if (teamId === null) {
        const request = await axios.get(`${process.env.INTE_BASE_URL}/api/student`, global.data.bearerConfig);
        return request.data;
    }

    const team = await axios.get(`${process.env.INTE_BASE_URL}/api/team/${teamId}`, global.data.bearerConfig);
    team.data.faction_name = global.data.factions.filter((f: any) => f.id === team.data.faction_id)[0].name;

    return team.data;
}
