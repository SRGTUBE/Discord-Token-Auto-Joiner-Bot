"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const discord_js_selfbot_v13_1 = __importDefault(require("discord.js-selfbot-v13"));
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = __importDefault(require("./utils"));
dotenv_1.default.config();
const client = new discord_js_1.Client({ intents: Object.keys(discord_js_1.GatewayIntentBits) });
client.login(process.env.CLIENT_TOKEN).catch(console.log);
client.on("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    //set command in bot
    const data = [
        {
            name: "jointokens",
            description: "join tokens to server",
            options: [
                {
                    name: "guildid",
                    description: "guild id",
                    type: 3,
                    required: true
                }
            ]
        }
    ];
    client.application?.commands.set(data);
});
client.on("interactionCreate", async (i) => {
    if (!i.isChatInputCommand())
        return;
    if (i.commandName == "jointokens") {
        const guildId = i.options.getString("guildid");
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return await i.reply({ embeds: [new discord_js_1.EmbedBuilder().setColor("Red").setDescription(`> Invalid Guild Id`)] });
        }
        let done = 0;
        const tokens = utils_1.default.getTokens() || [];
        await i.reply({ embeds: [new discord_js_1.EmbedBuilder().setColor("Green").setDescription(`> Starting (**${done}**/**${tokens.length}**)`)] });
        for (const token of tokens) {
            const tokenClient = new discord_js_selfbot_v13_1.default.Client({});
            tokenClient.on("ready", async () => {
                console.log(`[tokens] Logged in as ${tokenClient.user?.tag}! [${token}]`);
                try {
                    const oAuth2URL = utils_1.default.getOAuth2URL();
                    if (!oAuth2URL)
                        console.log("oAuth2URL null");
                    if (oAuth2URL) {
                        const authorize = await tokenClient.authorizeURL(oAuth2URL);
                        if (authorize.location) {
                            const code = authorize.location.split("code=")[1];
                            if (!code)
                                console.log("code null");
                            if (code) {
                                const accessToken = await utils_1.default.getAccessToken(code);
                                if (!accessToken)
                                    console.log("accessToken null");
                                if (accessToken) {
                                    const user = tokenClient.user?.id;
                                    const member = guild.members.cache.get(user);
                                    if (member) {
                                        console.log(`[Info] [tokens] ${tokenClient.user?.username} is Already in ${guild.name} [${token}]`);
                                    }
                                    else {
                                        await guild.members.add(user, { accessToken: accessToken });
                                        console.log(`[Done] [tokens] ${tokenClient.user?.username} joined ${guild.name} [${token}]`);
                                        done++;
                                        await i.editReply({ embeds: [new discord_js_1.EmbedBuilder().setColor("Green").setDescription(`> Starting (**${done}**/**${tokens.length}**)`)] });
                                    }
                                }
                            }
                        }
                    }
                    tokenClient.destroy();
                }
                catch (err) {
                    console.log(`[Error] [tokens] ${tokenClient.user?.username} Failed join ${guild.name} [${token}] with error ${err}`);
                    console.log(token);
                    tokenClient.destroy();
                }
            });
            tokenClient.on("error", (error) => {
                console.error(`[tokens] Error with token ${tokenClient.user?.tag}:${error} [${token}]`);
            });
            await tokenClient.login(token).catch(error => console.log(`invalid token ${token}`));
        }
    }
});
const tokens = utils_1.default.getTokens() || [];
console.log(tokens);
