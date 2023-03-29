import { log } from '../utils/logger';
import { callApi } from '../utils/api';
import { changeRoleAndName } from '../utils/changeRoleAndName';
import { GuildMember } from 'discord.js';
import { Command } from "../command";
import { BaseCommandInteraction, Client } from "discord.js";

export const Sync: Command = {
    name: "sync",
    description: "Sync automatically roles",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
		await interaction.reply('Sync in progress...');
		await sync();
		await interaction.followUp({ content: 'Sync done!' });
		log('Sync done!');
    }
};

// Function to sync every roles and names of the guild
async function sync() {
	const members = await globalThis.data.guild.members.fetch();

	const listStudents = await callApi();

	await Promise.all(members.map(async (member: GuildMember) => {
		await changeRoleAndName(member, listStudents, true);
	})).catch(error => {
		error('Sync roles and names failed!\n ' + error);
	});

	log('Finished syncRolesAndNames');
}

