import { Client, Interaction } from "discord.js";
import { Commands } from "../command";

export default (client: Client): void => {
    // Watch for commands
    client.on('interactionCreate', async (interaction: Interaction) => {
        if (interaction.guild === null || interaction.guild.id !== data.guild.id) return;

        if (interaction.isCommand() || interaction.isContextMenu()) {
            const slashCommand = Commands.find(c => c.name === interaction.commandName);
            if (!slashCommand) {
                interaction.reply({ content: "An error has occurred" });
                return;
            }

            slashCommand.run(client, interaction);
        }
    });
};

