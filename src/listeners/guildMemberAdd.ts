import { Client, GuildMember } from 'discord.js';
import { log } from '../utils/logger';
import { changeRoleAndName } from '../utils/functions';

export default (client: Client): void => {
    // Watch for new users
    client.on('guildMemberAdd', (member: GuildMember) => {
        log(`New User "${member.user.username}" has joined "${member.guild.name}"`);

        changeRoleAndName(member);
    });
};
