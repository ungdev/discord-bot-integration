import { log } from '../utils/logger';
import { callApi } from '../utils/api';
import { changeRoleAndName } from '../utils/functions';
import { ApplicationCommandType, GuildMember } from 'discord.js';
import { Command } from '../command';
import { CommandInteraction, Client } from 'discord.js';

export const Sync: Command = {
    name: 'sync',
    description: 'Sync automatically roles',
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        log('Sync started!');
        await interaction.reply('Sync in progress...');
        await sync();
        await interaction.followUp({ content: 'Sync done!' });
        log('Sync done!');
    },
};

// Function to sync every roles and names of the guild
async function sync() {
    const members = await global.data.guild?.members.fetch();
    if (members === undefined) return;

    const listStudents = await callApi();

    await Promise.all(
        members.map(async (member: GuildMember) => {
            await changeRoleAndName(member, listStudents, true);
        }),
    ).catch((error) => {
        error('Sync roles and names failed!\n ' + error);
    });

    log('Finished syncRolesAndNames');
}
