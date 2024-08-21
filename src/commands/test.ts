import {SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder} from "discord.js";

export const PingCommand: { data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder; execute(interaction): Promise<void> } = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};