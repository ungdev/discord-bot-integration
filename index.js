// Load the .env file
require('dotenv').config();

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');

// Load additional libraries
const axios = require('axios');
const httpBuildQuery = require('http-build-query');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

let guild;
let bearer;
let accessTokenEtu;

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	console.log('Ready!');

	guild = client.guilds.cache.get(process.env.GUILD_ID);

	client.user.setPresence({
		activities: [{
			name: process.env.BOT_ACTIVITY,
		}],
		status: 'online',
	});

	syncRolesAndNames();
});

// Watch for commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	switch (commandName) {
	case 'sync':
		syncRolesAndNames();
		await interaction.reply('Sync in progress!');
		break;
	default:
		break;
	}
});

// Watch for new users
client.on('guildMemberAdd', member => {
	console.log(`New User "${member.user.username}" has joined "${member.guild.name}"`);

	changeRoleAndName(member);
});

// Function to call the integration API and list each students in the website
async function callApi() {
	if (accessTokenEtu === '' || bearer === undefined || (bearer.expires_at !== undefined && bearer.expires_at < Date.now()) || (bearer.access_token !== undefined && bearer.access_token === null)) {
		let data = {
			grant_type: 'client_credentials',
			scopes: 'public',
			client_id: process.env.SITE_ETU_CLIENT_ID,
			client_secret: process.env.SITE_ETU_CLIENT_SECRET,
		};
		const requestToken = await axios.post(
			`${process.env.ETU_BASE_URL}/api/oauth/token?${httpBuildQuery(data)}`,
		);
		accessTokenEtu = requestToken.data.access_token.toString();

		data = {
			access_token: accessTokenEtu,
		};

		const response = await axios.post(
			`${process.env.INTE_BASE_URL}/api/oauth/discord/callback?${httpBuildQuery(data)}`,
		);
		bearer = response.data;
	}

	const finalList = await axios.get(
		`${process.env.INTE_BASE_URL}/api/student`,
		{
			headers: { Authorization: `Bearer ${bearer.access_token}` },
		},
	);

	return finalList.data;
}

// Function to sync every roles and names of the guild
async function syncRolesAndNames() {
	const members = await guild.members.fetch();

	const list = await callApi();

	members.forEach(mb => {
		changeRoleAndName(mb, list);
	});
}

// Function to change a role or a name
async function changeRoleAndName(member, listStudents = null) {
	const { user } = member;
	if (!user.bot) {
		const tag = `${user.username}#${user.discriminator}`;

		if (listStudents === null) {
			listStudents = await callApi();
		}

		const userSite = listStudents.filter(o => o.discord === tag);

		if (userSite.length === 1) {
			// The user did connect let's add role and change name
			const u = userSite[0];

			// Can't change owner's name
			if (member.user.id !== guild.ownerId) {
				/* -----------------------------
							ADD ROLES
				----------------------------- */

				const rolesList = [process.env.NEWCOMER_ROLE, process.env.ADMIN_ROLE, process.env.CE_ROLE, process.env.ORGA_ROLE, process.env.VOLUNTEER_ROLE];

				let roleName;
				if (u.is_newcomer === 1) {
					roleName = process.env.NEWCOMER_ROLE;
					// TODO: add some more roles including faction & team
				}
				else if (u.admin > 0) {
					roleName = process.env.ADMIN_ROLE;
				}
				else if (u.ce === 1) {
					roleName = process.env.CE_ROLE;
					// TODO: add some more roles including faction & team
				}
				else if (u.orga === 1) {
					roleName = process.env.ORGA_ROLE;
				}
				else if (u.volunteer === 1) {
					roleName = process.env.VOLUNTEER_ROLE;
				}

				// Remove old roles
				rolesList.forEach(string => {
					const role = guild.roles.cache.find(rol => rol.name === string);
					member.roles.remove(role).catch(console.error);
				});

				const role = guild.roles.cache.find(rol => rol.name === roleName);
				member.roles.add(role).catch(console.error);

				/* -----------------------------
							RENAME
				----------------------------- */

				const firstName = u.first_name;
				// Remove too long last name
				const lastName = u.last_name.split(/[-\s]/)[0];
				let name = firstName + ' ' + lastName;

				// 32 characters is the maximum length of a discord name
				const maxChar = 32 - 3 - roleName.length;

				// If too long name then remove some chars
				if (name > maxChar) {
					name = name.substring(0, maxChar);
				}

				member.setNickname(name + ' - ' + roleName);
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
