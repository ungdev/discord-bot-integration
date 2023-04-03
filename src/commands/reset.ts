import { log } from '../utils/logger';
import { CommandInteraction, Client } from "discord.js";
import { Command } from "../command";

export const Reset: Command = {
    name: "reset",
    description: "Reset roles given by the bot, roles and channels",
    run: async (client: Client, interaction: CommandInteraction) => {
		log('Reset started!');
		await interaction.reply('Reset in progress...');
		await reset();
		await interaction.followUp({ content: 'Reset done!' });
		log('Reset done!');
    }
};

async function reset() {
	// Get all members of the guild
	const members = await globalThis.data.guild.members.fetch();
	await Promise.all(members.map(async (member: any) => {
		// Can't change owner's name
		if (member.user.id !== globalThis.data.guild.ownerId) {
			/* -----------------------------
						REMOVE ROLES
			----------------------------- */

			const rolesList = [process.env.NEWCOMER_ROLE, process.env.CE_ROLE, process.env.ORGA_ROLE];

			// Remove old roles
			rolesList.forEach(string => {
				const role = globalThis.data.guild.roles.cache.find((rol: any) => rol.name === string);
				if (role === undefined) {
					log(`Role "${string}" doesn't exist in this guild!`);
				}
				else {
					member.roles.remove(role).catch((error: any) => {
						error(error);
					});
				}
			});
		}
	}));

	await Promise.all(globalThis.data.factionsCategoryIds.map(async (categoryId: number) => {
		try {
			const category = await globalThis.data.guild.channels.cache.get(categoryId);
			await Promise.all(category.children.map(async (channel: any) => {
				try {
					await channel.delete();
				}
				catch (error: any) {
					error(error);
				}
			}));

			await category.delete();
		}
		catch (error: any) {
			error(error);
		}

		globalThis.data.factionsCategoryIds.splice(globalThis.data.factionsCategoryIds.indexOf(categoryId), 1);
	}));

	await Promise.all(globalThis.data.rolesCreatedIds.map(async (roleId: number) => {
		// Remove and handle error
		try {
			await globalThis.data.guild.roles.cache.get(roleId).delete();
		}
		catch (error: any) {
			error(error);
		}

		globalThis.data.rolesCreatedIds.splice(globalThis.data.rolesCreatedIds.indexOf(roleId), 1);
	}));

	global.db.set('roles', []);
	global.db.set('factions', []);
}