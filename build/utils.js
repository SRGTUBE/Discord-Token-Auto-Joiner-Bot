"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.default = {
    getTokens() {
        const tokensPath = path_1.default.join(__dirname, "..", "tokens.txt");
        if (fs_1.default.existsSync(tokensPath)) {
            const tokens = fs_1.default.readFileSync(tokensPath, "utf-8").split("\n").filter(Boolean);
            return tokens.length ? tokens : null;
        }
        return null;
    },
    getOAuth2URL() {
        const ClientId = process.env.CLIENT_ID;
        const redirectUrl = process.env.REDIRECT_URL;
        const scopes = "guilds.join+identify";
        if (ClientId && redirectUrl) {
            return `https://discord.com/oauth2/authorize?client_id=${ClientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=${scopes}`;
        }
        return null;
    },
    async getAccessToken(code) {
        const ClientId = process.env.CLIENT_ID;
        const ClientSecret = process.env.CLIENT_SECRET;
        const redirectUrl = process.env.REDIRECT_URL;
        if (!ClientId || !ClientSecret || !redirectUrl)
            return null;
        const params = new URLSearchParams();
        params.append("client_id", ClientId);
        params.append("client_secret", ClientSecret);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", redirectUrl);
        try {
            const response = await fetch("https://discord.com/api/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params.toString()
            });
            if (!response.ok) {
                console.error("Failed to fetch access token", response.statusText);
                return null;
            }
            const data = await response.json();
            return data.access_token || null;
        }
        catch (error) {
            console.error("Error fetching access token", error);
            return null;
        }
    }
};
