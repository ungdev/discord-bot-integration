import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import {SlashCommandSubcommandsOnlyBuilder} from "discord.js";
import {db} from "../../database/db";
import {teamSchema} from "../../schemas/team.schema";
import {eq} from "drizzle-orm";
import {createError} from "../utils/error-embed";
import {isCe, isOrga} from "../utils/assert-role";

export async function list(interaction) {
    const teams = await db.select().from(teamSchema);

    if(!isCe(interaction) && !isOrga(interaction)) return interaction.reply({embeds: [createError("You don't have the permission to do this command.")]});

    if (!teams || teams.length === 0) return interaction.reply({ embeds: [createError("No teams found.")] });

    const listEmbed = new EmbedBuilder()
        .setColor([0, 255, 0])
        .setTitle('Teams list')
        .addFields({ name: ' ', value: `----------------------`  })
        .setTimestamp();

    teams.forEach(team => {
        listEmbed.addFields({ name: team.name, value: `Points: ????` });
    });
    listEmbed.addFields({ name: ' ', value: `----------------------` })
    return interaction.reply({ embeds: [listEmbed] });
}