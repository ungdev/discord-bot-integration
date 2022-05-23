// Load the .env file
require('dotenv').config();

// Require the necessary discord.js classes
const { Client, Intents, Permissions } = require('discord.js');

// Load additional libraries
const axios = require('axios');
const httpBuildQuery = require('http-build-query');

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
	res.send('OK !');
});

app.listen(port);

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

const data = {
	bearer: null,
	bearerConfig: null,
	guild: null,
	factions: null,
	teams: null,
	rolesList: null,
};

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	console.log('Ready!');

	data.guild = client.guilds.cache.get(process.env.GUILD_ID);

	client.user.setPresence({
		activities: [{
			name: process.env.BOT_ACTIVITY,
		}],
		status: 'online',
	});

	data.rolesList = [data.guild.roles.cache.find(rol => rol.name === process.env.NEWCOMER_ROLE), data.guild.roles.cache.find(rol => rol.name === process.env.CE_ROLE), data.guild.roles.cache.find(rol => rol.name === process.env.ORGA_ROLE)];
});

// Watch for commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	// TODO : check guild id to avoid commands from other guilds
	const { commandName } = interaction;

	switch (commandName) {
	case 'sync':
		await interaction.reply('Sync in progress...');
		await syncRolesAndNames();
		await interaction.followUp({ content: 'Sync done!' });
		console.log('Sync done!');
		break;
	case 'reset-roles':
		await interaction.reply('Reset in progress...');
		await resetRoles();
		await interaction.followUp({ content: 'Reset done!' });
		console.log('Reset done!');
		break;
	case 'create-roles-channels':
		await interaction.reply('Creation in progress...');
		await createRolesAndChannels();
		await interaction.followUp({ content: 'Creation done!' });
		console.log('Creation done!');
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

client.on('guildMemberUpdate', async (oldMember, newMember) => {
	if (oldMember.roles.cache.size < newMember.roles.cache.size) {
		const fetchedLogs = await oldMember.guild.fetchAuditLogs({
			limit: 1,
			type: 'MEMBER_ROLE_UPDATE',
		});

		const roleAddLog = fetchedLogs.entries.first();
		if (!roleAddLog) return;
		const { executor, target, changes } = roleAddLog;

		console.log(`Role ${changes[0].new[0].name} added to <@${target.username}#${target.discriminator}> by <@${executor.username}#${executor.discriminator}>`);

		if (changes[0].new[0].id === data.rolesList[0].id || changes[0].new[0].id === data.rolesList[1].id || changes[0].new[0].id === data.rolesList[2].id) {
			const tag = `${target.username}#${target.discriminator}`;

			const listStudents = await callApi();

			const userSite = listStudents.filter(o => o.discord === tag);

			renameMember(newMember, userSite[0], changes[0].new[0].name);
		}
	}
});

// Function to call the integration API and list each students in the website
async function callApi(teamId = null) {
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
	team.data.faction_name = data.factions.filter(f => f.id === team.data.faction_id)[0].name;

	return team.data;
}

async function resetRoles() {
	// Get all members of the guild
	const members = await data.guild.members.fetch();
	members.forEach(member => {
		// Can't change owner's name
		if (member.user.id !== data.guild.ownerId) {
			/* -----------------------------
					   REMOVE ROLES
			----------------------------- */

			const rolesList = [process.env.NEWCOMER_ROLE, process.env.CE_ROLE, process.env.ORGA_ROLE];

			// Remove old roles
			rolesList.forEach(string => {
				const role = data.guild.roles.cache.find(rol => rol.name === string);
				if (role === undefined) {
					console.log(`Role "${string}" doesn't exist in this guild!`);
				}
				else {
					member.roles.remove(role).catch(console.error);
				}
			});
		}

		// TODO: remove factions roles and names as well
	});
}

// Function to sync every roles and names of the guild
async function syncRolesAndNames() {
	const members = await data.guild.members.fetch();

	const listStudents = await callApi();

	for (const mb of members) {
		await changeRoleAndName(mb[1], listStudents, true);
	}

	console.log('Finished syncRolesAndNames');
}

// Function to change a role or a name
async function changeRoleAndName(member, listStudents = null, isSync = false) {
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
			if (member.user.id !== data.guild.ownerId) {
				/* -----------------------------
							ADD ROLES
				----------------------------- */

				const rolesToAdd = [];
				if (u.is_newcomer === 1) {
					rolesToAdd.push(data.rolesList[0]);
					// RolesToAdd = rolesToAdd.concat(await addTeamRole(member, u.team_id));
				}
				else {
					if (u.ce === 1) {
						rolesToAdd.push(data.rolesList[1]);
						// RolesToAdd = rolesToAdd.concat(await addTeamRole(member, u.team_id));
					}

					if (u.orga === 1) {rolesToAdd.push(data.rolesList[2]);}
				}


				// Remove old roles
				await member.roles.remove(data.rolesList).catch(console.error);

				// Add new roles
				await member.roles.add(rolesToAdd).catch(console.error);


				/* -----------------------------
							RENAME
				----------------------------- */
				if (rolesToAdd[0] !== undefined) {
					await renameMember(member, u, rolesToAdd[0].name);
				}
			}
		}
		else if (!isSync) {
			member.send(`Salut <@${user.id}>, tu dois t'inscrire sur le site de l'Intégration (https://integration.utt.fr/) en renseignant ton tag discord pour obtenir tes rôles et avoir accès à tous les channels de discussion !`);
		}
		else {
			console.log(`${tag} is not in the list`);
		}
	}
}

// Add faction and team role for newcomers and ce
async function addTeamRole(member, teamId) {
	if (teamId === null) {
		return [];
	}

	const team = await callApi(teamId);
	return [team.name, team.faction_name];
}

// Rename user to [Prénom NOM - Role]
async function renameMember(member, userSite, roleName) {
	const firstName = userSite.first_name.toLowerCase().replace(/\w\S*/g, w => (w.replace(/^\w/, c => c.toUpperCase())));
	// Remove too long last name
	const lastName = userSite.last_name.toUpperCase().split(/[-\s]/)[0];
	let name = firstName + ' ' + lastName;

	// 32 characters is the maximum length of a discord name
	const maxChar = 32 - 3 - roleName.length;

	// If too long name then remove some chars
	if (name > maxChar) {
		name = name.substring(0, maxChar);
	}

	const roleSuffix = (roleName === null) ? '' : ' - ' + roleName;

	await member.setNickname(name + roleSuffix);
}

// Create roles for the factions and the teams
async function createRolesAndChannels() {
	await callApi();
	const cat = [];
	await data.factions.forEach(async faction => {
		await addRole(faction.name, true);
		cat.push(await addCategory(faction.name));
	});
	await data.teams.forEach(async team => {
		if (team.name !== undefined && team.name !== null && team.name !== '') {
			await addRole(team.name, false);
			await addChannel(team, cat);
		}
	});
}

// Create a category
async function addCategory(name) {
	const category = await data.guild.channels.create(name, {
		type: 'GUILD_CATEGORY',
		permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGES', 'MANAGE_MESSAGES', 'MANAGE_ROLES', 'MANAGE_CHANNELS'],
		position: 0,
	});
	// TODO: save category id list to reverse channels creation
	return category;
}

// Create a channel and add it to the category
async function addChannel(team, cat) {
	const channel = await data.guild.channels.create(team.name, {
		type: 'text',
		permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGES', 'MANAGE_MESSAGES', 'MANAGE_ROLES', 'MANAGE_CHANNELS'],
		position: 0,
	});

	await channel.setParent(cat.find(c => c.name.toLowerCase() === team.faction.name.toLowerCase()).id);

	// Modify permissions for the team role and disable view form everyone
	await channel.permissionOverwrites.edit(data.guild.roles.cache.find(rol => rol.name === process.env.ORGA_ROLE).id, {
		VIEW_CHANNEL: true,
	});
	await channel.permissionOverwrites.edit(data.guild.roles.cache.find(rol => rol.name.toLowerCase() === team.name.toLowerCase()).id, {
		VIEW_CHANNEL: true,
	});
	await channel.permissionOverwrites.edit(data.guild.id, {
		VIEW_CHANNEL: false,
	});
}

// Create role
async function addRole(roleName, isFaction) {
	const role = await data.guild.roles.create({
		name: roleName,
		color: '#000000',
		mentionable: true,
		hoist: true,
		position: 3,
	})
		.then(created => console.log(`Created role ${created.name}`))
		.catch(console.error);
}


// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
