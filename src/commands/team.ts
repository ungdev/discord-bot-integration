import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import {createError} from "./utils/error-embed";
import {list} from "./team/team-list";
import {assign} from "./team/team-assign";
import {remove} from "./team/team-remove";
import {SlashCommandSubcommandsOnlyBuilder} from "discord.js";

export const Team: { data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder; execute(interaction): Promise<void> } = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Manage teams')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Show a list of every teams')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('assign')
                .setDescription('Assign a user to a team')
                .addStringOption(option =>
                    option
                        .setName('team')
                        .setDescription('The name of the team')
                        .setRequired(true),
                )
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The ID of the user to assign')
                        .setRequired(true),
                ),
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a user from a team')
                .addStringOption(option =>
                    option
                        .setName('team')
                        .setDescription('The name of the team')
                        .setRequired(true),
                )
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The ID of the user to remove')
                        .setRequired(true),
                ),
        ),
    async execute(interaction) {
        switch (interaction.options._subcommand) {
            case 'assign': return assign(interaction)
            case 'list':   return list(interaction)
            case 'remove': return remove(interaction)
            default: return interaction.reply({ embeds: [createError('Invalid subcommand.')] });
        }
    },
};