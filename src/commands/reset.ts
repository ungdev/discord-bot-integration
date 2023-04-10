import { log } from '../utils/logger';
import { CommandInteraction, Client, GuildMember, Role, ApplicationCommandType, CategoryChannel } from 'discord.js';
import { Command } from '../command';

export const Reset: Command = {
    name: 'reset',
    description: 'Reset roles given by the bot, roles and channels',
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        log('Reset started!');
        await interaction.reply('Reset in progress...');
        await reset();
        await interaction.followUp({ content: 'Reset done!' });
        log('Reset done!');
    },
};

async function reset() {
    // Get all members of the guild
    const members = await global.data.guild?.members.fetch();
    if(members === undefined) return;
    
    log(`Reset: Found ${members?.size} members in the guild!`)
    await Promise.all(
        members.map(async (member: GuildMember) => {
            // Get all roles of the member
            const roles = member.roles.cache;
            log(`Reset: Found ${roles.size} roles for member ${member.user.username}!`)
            // Remove all roles given by the bot
            await Promise.all(
                roles.map(async (role: Role) => {
                    if (global.data.rolesList.map((o: any) => o.id).includes(role.id)) {
                        log(`Reset: Removing role ${role.name} from member ${member.user.username}...`)
                        await member.roles.remove(role).catch((error: any) => {
                            error(error);
                        });
                    }
                }),
            );
        }),
    );

    await Promise.all(
        global.data.factionsCategoryIds.map(async (categoryId: number) => {
            try {
                // Get category
                const category = await global.data.guild?.channels.cache.get(categoryId.toString()) as CategoryChannel;
                if (category !== undefined) {
                    log(`Reset: Deleting category ${category.name}...`)
                    // Delete all channels
                    await Promise.all(
                        category.children.cache.map(async (channel: any) => {
                            log(`Reset: Deleting channel ${channel.name}...`)
                            await channel.delete();
                        }),
                    );

                    await category.delete();
                }
            } catch (error: any) {
                error(error);
            }
        }),
    );

    await Promise.all(
        global.data.rolesCreatedIds.map(async (roleId: number) => {
            // Remove and handle error
            try {
                log(`Reset: Deleting role ${roleId}...`)
                await global.data.guild?.roles.cache.get(roleId.toString())?.delete();
            } catch (error: any) {
                error(error);
            }
        }),
    );
    
    global.data.factionsCategoryIds = [];
    global.data.rolesCreatedIds = [];
    global.db.set('roles', []);
    global.db.set('factions', []);
}
