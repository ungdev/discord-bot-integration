require('dotenv').config();

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');

const axios = require('axios');
const httpBuildQuery = require('http-build-query');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });
let guild;

const temp = [
	{
		first_name: 'Noé',
		last_name: 'Landré',
		discord: 'Nono#1132',
		admin: 1,
		ce: 0,
		orga: 0,
		volunteer: 1,
		is_newcomer: 0,
	},
	{
		first_name: 'Alban',
		last_name: 'SOUCHARD DE LAVOREILLE',
		discord: 'DevNono#0099',
		admin: 0,
		ce: 0,
		orga: 0,
		volunteer: 1,
		is_newcomer: 0,
	},
];

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
	guild = client.guilds.cache.get(process.env.GUILD_ID);
	client.user.setPresence({
		activities: [{
			name: 'Préparer l\'Intégration',
			type: 'STREAMING',
		}],
		status: 'online',
	});

	recheckRolesAndNames();
});

client.on('guildMemberAdd', member => {
	console.log(`New User "${member.user.username}" has joined "${member.guild.name}"`);

	changeRoleAndName(member);
});

async function recheckRolesAndNames() {
	const members = await guild.members.fetch();

	const list = axios.get('https://integration.utt.fr/api/');

	members.forEach(mb => {
		changeRoleAndName(mb, temp);
	});
}

async function callApi() {
	const donnees = {
		grant_type: 'client_credentials',
		scopes: 'public',
		client_id: process.env.SITE_ETU_CLIENT_ID,
		client_secret: process.env.SITE_ETU_CLIENT_SECRET,
	};
	const requestToken = await axios.post(
		`${process.env.ETU_BASE_URL}/api/oauth/token?${httpBuildQuery(donnees)}`,
	);

	const accessToken = requestToken.data.access_token.toString();
	if (accessToken !== '') {
		const request = {
			access_token: accessToken,
		};
		'/oauth/discord/callback';
	}
}

function changeRoleAndName(member, listStudents = null) {
	const { user } = member;
	if (!user.bot) {
		const tag = `${user.username}#${user.discriminator}`;

		if (listStudents === null) {
			listStudents = [];
			// TODO: add an API call
		}

		const userSite = listStudents.filter(o => o.discord === tag);

		if (userSite.length === 1) {
			// The user did connect let's add role and change name
			const u = userSite[0];

			if (member.user.id !== guild.ownerId) {
				let roleName;
				if (u.is_newcomer === 1) {
					roleName = 'Nouveau';
				}
				else if (u.admin > 0) {
					roleName = 'Admin';
				}
				else if (u.ce === 1) {
					roleName = 'CE';
				}
				else if (u.orga === 1) {
					roleName = 'Orga';
				}
				else if (u.volunteer === 1) {
					roleName = 'Bénévole';
				}

				const role = guild.roles.cache.find(rol => rol.name === roleName);
				member.roles.add(role).catch(console.error);
				member.setNickname(u.first_name + ' ' + u.last_name + ' - ' + roleName);
			}
		}
		else {
			// TODO: the user didn't connect his discord to the website yet
			console.log('Need to connect to the website');
		}
	}
}


// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
