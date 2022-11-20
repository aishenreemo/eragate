import discord from "discord.js";

export class EragateClient extends discord.Client {
    public commands: discord.Collection<String, Function>;
    public rest: discord.REST;
    public token: string;

    public constructor(intents: Array<discord.GatewayIntentBits>, token: string) {
        super({ intents });

        this.token = token;
        this.commands = new discord.Collection();
        this.rest = new discord.REST({ version: '10' }).setToken(token);
    }

    public _login() {
        super.login(this.token);
    }
}
