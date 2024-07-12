import {EmbedBuilder} from "@discordjs/builders";


export function createError(desc: string, help?: string) {

    if(help)    return new EmbedBuilder()
        .setColor([136, 8, 8])
        .setTitle('Error')
        .setDescription(desc)
        .addFields(
            { name: 'Help', value: help },
        )
        .setTimestamp();

    return new EmbedBuilder()
        .setColor([136, 8, 8])
        .setTitle('Error')
        .setDescription(desc)
        .setTimestamp();
}