import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import {SlashCommandSubcommandsOnlyBuilder} from "discord.js";
import {db} from "../database/db";
import {teamSchema} from "../schemas/team.schema";
import {eq} from "drizzle-orm";
import {createError} from "./utils/error-embed";
import {list} from "./team/team-list";
import {assign} from "./team/team-assign";

export const Team = {
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
        ),
    async execute(interaction) {
        switch (interaction.options._subcommand) {
            case 'assign': return assign(interaction)
            case 'list':   return list(interaction)
            default: return interaction.reply({ embeds: [createError('Invalid subcommand.')] });
        }
    },
};