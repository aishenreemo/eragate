import discord from "discord.js";

export class EragateClient extends discord.Client {
    public commands: discord.Collection<String, Function>;
    public constructor(intents: Array<discord.GatewayIntentBits>) {
        super({ intents });

        this.commands = new discord.Collection();
    }
}
