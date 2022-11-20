import * as client from "../../structs/client";
import discord from "discord.js";

export const data = new discord.SlashCommandBuilder()
    .setName("ping")
    .setDescription("check my latency");

export async function execute(bot: client.EragateClient, interaction: discord.Interaction) {
    let embed = new discord.EmbedBuilder()
        .setTitle("Pong!")
        .setDescription(`Latency: ${Date.now() - interaction.createdTimestamp}ms\n`
            .concat(    `API Latency: ${Math.round(bot.ws.ping)}ms`));

    if (interaction.isRepliable()) await interaction.reply({ embeds: [embed] });
}
