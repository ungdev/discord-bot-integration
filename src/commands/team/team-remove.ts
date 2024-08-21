import {db} from "../../database/db";
import {teamSchema} from "../../schemas/team.schema";
import {eq} from "drizzle-orm";
import {createError} from "../utils/error-embed";
import {isCe, isOnlyCe} from "../utils/assert-role";
import {userSchema} from "../../schemas/user.schema";

export async function remove(interaction) {

    if(!isCe(interaction)) return interaction.reply({embeds: [createError("You don't have the permission to do this command.")]});

    const teamName = interaction.options.getString('team');
    const userId = interaction.options.getUser('user');

    const user = await interaction.guild.members.fetch(userId).catch(() => null);

    if (!user) {
        return interaction.reply({ embeds: [createError('Invalid user ID.')] });
    }

    //Getting user in db to check if he is in the team
    const users = await db.select().from(userSchema).where(eq(userSchema.discord_id, userId))

    //Getting the user
    const ce = users[0]
    if(!ce) return interaction.reply({ embeds: [createError(`No user associated in database with username '${userId}'.`)] });
    if(!isOnlyCe(interaction)) {
        //If CE, he needs to be on this team to manage users

        //Get team name from id
        console.log("ce is in team: " + ce.team)
        //const teamsDb = await db.select().from(teamSchema).where(eq(teamSchema.id, ce.team));
        //const team = teamsDb[0]

        //Compare teamDb name with desired team in command parameter
    }


    /*
    if (!team || !team[0]) {
        return interaction.reply({ embeds: [createError(`Invalid team name '${teamName}'`, 'Use /team list command.')] });
    }

    const id = team[0].id
    const userDiscordId = user.user.username
    //setting id in User.team_id by matching discord_id
    */

    /* <!> Not working for now cause of lack of column discord_id in database <!> */

    await interaction.reply(`<!> Not working for now cause of lack of column discord_id in database <!>`);

    //await interaction.reply(`Assigning user ${user.user.username} to team: ${teamName}`);
}