import {db} from "../../database/db";
import {teamSchema} from "../../schemas/team.schema";
import {eq} from "drizzle-orm";
import {createError} from "../utils/error-embed";

export async function assign(interaction) {
    const teamName = interaction.options.getString('team');
    const userId = interaction.options.getUser('user');

    // Vérifie si l'ID utilisateur est valide (par exemple, si l'utilisateur existe sur le serveur)
    const user = await interaction.guild.members.fetch(userId).catch(() => null);

    if (!user) {
        return interaction.reply({ embeds: [createError('Invalid user ID.')] });
    }

    //Getting id of the team
    const team = await db.select().from(teamSchema).where(eq(teamSchema.name, teamName));

    if (!team || !team[0]) {
        return interaction.reply({ embeds: [createError(`Invalid team name '${teamName}'`, 'Use /team list command.')] });
    }

    const id = team[0].id
    const userDiscordId = user.user.username
    //setting id in User.team_id by matching discord_id

    /* <!> Not working for now cause of lack of column discord_id in database <!> */

    await interaction.reply(`<!> Not working for now cause of lack of column discord_id in database <!>`);

    //await interaction.reply(`Assigning user ${user.user.username} to team: ${teamName}`);
}