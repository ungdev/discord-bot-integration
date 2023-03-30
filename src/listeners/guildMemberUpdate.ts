import { Client } from "discord.js";
import { callApi } from "../utils/api";
import { log } from "../utils/logger";
import { renameMember } from "../utils/functions";


export default (client: Client): void => {
    // Watch for users update (role change)
    client.on('guildMemberUpdate', async (oldMember: any, newMember: any) => {
        if (oldMember.roles.cache.size < newMember.roles.cache.size) {
            const fetchedLogs = await oldMember.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_ROLE_UPDATE',
            });

            const roleAddLog = fetchedLogs.entries.first();
            if (!roleAddLog) return;
            const { executor, target, changes } = roleAddLog;
            
            if(changes === undefined || changes[0] === undefined || changes[0]?.new === undefined) return;
            let change = (changes[0] as any).new[0];

            log(`Role ${change.name} added to <@${target?.username}#${target?.discriminator}> by <@${executor?.username}#${executor?.discriminator}>`);

            if ((change.id === global.data.rolesList[0].id || change.id === global.data.rolesList[1].id || change.id === global.data.rolesList[2].id) && executor?.id !== process.env.CLIENT_ID) {
                const tag = `${target?.username}#${target?.discriminator}`;

                const listStudents = await callApi();

                const userSite = listStudents.filter((o: any) => o.discord === tag);
                if (userSite.length !== 0) {
                    renameMember(newMember, userSite[0], change.name);
                }
            }
        }
    });
};