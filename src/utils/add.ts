import { callApi } from './api';
import { log } from './logger';

// Add faction and team role for newcomers and ce
export async function addTeamRole(teamId: number) {
	if (teamId === null) {
		return [];
	}

	const team = await callApi(teamId);

	return [data.guild.roles.cache.find((rol: any) => rol.name === team.name), data.guild.roles.cache.find((rol: any) => rol.name === team.faction_name)];
}

// Create a category
export async function addCategory(name: string) {
	const category = await data.guild.channels.create(name, {
		type: 'GUILD_CATEGORY',
		permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGES', 'MANAGE_MESSAGES', 'MANAGE_ROLES', 'MANAGE_CHANNELS'],
		position: 0,
	});
	data.factionsCategoryIds.push(category.id);
	db.set('factions', data.factionsCategoryIds);
	return category;
}

// Create a channel and add it to the category
export async function addChannel(team: any, cat: any) {
	const channel = await data.guild.channels.create(team.name, {
		type: 'text',
		permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGES', 'MANAGE_MESSAGES', 'MANAGE_ROLES', 'MANAGE_CHANNELS'],
		position: 0,
	});

	await channel.setParent(cat.find((c: any) => c.name.toLowerCase() === team.faction.name.toLowerCase()).id);

	// Modify permissions for the team role and disable view form everyone
	const listRolesCanView = [process.env.COORDS_ROLE, process.env.CE_RESPO, process.env.DEV_ROLE];
	await Promise.all(listRolesCanView.map(async role => {
		await channel.permissionOverwrites.edit(data.guild.roles.cache.find((rol: any) => rol.name === role).id, {
			VIEW_CHANNEL: true,
		});
	}));

	try {
		await channel.permissionOverwrites.edit(data.guild.roles.cache.find((rol: any) => rol.name.toLowerCase().trim() === team.name.toLowerCase().trim()).id, {
			VIEW_CHANNEL: true,
		});
	}
	catch (error: any) {
		error(error);
	}

	await channel.permissionOverwrites.edit(data.guild.id, {
		VIEW_CHANNEL: false,
	});
}

// Create role
export async function addRole(roleName: string) {
	await data.guild.roles.create({
		name: roleName,
		color: '#000000',
		mentionable: true,
		hoist: true,
	}).then((created: any) => {
		log(`Created role ${created.name}`);
		data.rolesCreatedIds.push(created.id);
		db.set('roles', data.rolesCreatedIds);
		return 0;
	}).catch(console.error);
}
