import {CategoryChannel, GuildMember, Interaction, Role, SlashCommandBuilder} from "discord.js";
import {log, error} from "../utils/logger";

export const ResetCommand: { data: SlashCommandBuilder; execute(interaction): Promise<void> } = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset roles given by the bot, roles and channels'),
    async execute(interaction) {
        log('Reset started!');
        await interaction.reply('Reset in progress...');
        await reset(interaction);
        await interaction.followUp({ content: 'Reset done!' });
        log('Reset done!');
    },
};

export async function reset(interaction: Interaction) {
    // Get all members of the guild
    const members = await interaction.guild?.members.cache;
    if (members === undefined) return;

    log(`Reset: Found ${members.size} members in the guild!`);
    await Promise.all(
        members.map(async (member: GuildMember) => {
            // Get all roles of the member
            const roles = member.roles.cache;
            // log(`Reset: Found ${roles.size} roles for member ${member.user.username}!`)
            // Remove all roles given by the bot
            await Promise.all(
                roles.map(async (role: Role) => {
                    if (global.data.rolesList.map((o: any) => o.id).includes(role.id)) {
                        log(`Reset: Removing role ${role.name} from member ${member.user.username}...`);
                        await member.roles.remove(role).catch((err: any) => {
                            error(err);
                        });
                    }
                }),
            );
        }),
    );

    log(`Reset: Deleting ${global.data.factionsCategoryIds.length} categories...`);
    await Promise.all(
        global.data.factionsCategoryIds.map(async (categoryId: string) => {
            // Get category
            console.log("catId:" + categoryId)
            const category = interaction.guild?.channels.cache.get(categoryId) as CategoryChannel;
            console.log(category)
            if (category !== undefined && category !== null) {
                log(`Reset: Deleting category ${category.name}...`);
                // Delete all channels
                await Promise.all(
                    category.children.cache.map(async (channel: any) => {
                        log(`Reset: Deleting channel ${channel.name}...`);
                        await channel.delete().catch((err: any) => {
                            error(err);
                        });
                    }),
                );

                await category.delete().catch((err: any) => {
                    error(err);
                });
            }
        }),
    );

    log(`Reset: Deleting ${global.data.rolesCreatedIds.length} roles...`);
    await Promise.all(
        global.data.rolesCreatedIds.map(async (roleId: number) => {
            const role = await global.data.guild?.roles.cache.get(roleId.toString());
            if (role !== undefined && role !== null) {
                // Remove and handle error
                log(`Reset: Deleting role ${roleId}...`);
                await role.delete().catch((err: any) => {
                    error(err);
                });
            }
        }),
    );
}