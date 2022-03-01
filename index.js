const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const isOnline = async (url) => {
	try {
		const res = await axios.get(url);
		return res;
	} catch (err) {
		// console.error(err);
		return err.response;
	}
};

bot.onText(/\/start/, (msg, match) => {
	const chatId = msg.chat.id;
	bot.sendMessage(
		chatId,
		"Hello!\nI'm a bot created by Arniclas.\n\nTo start, please, type /help to see the list of commands."
	);
});

bot.onText(/\/help/, (msg, match) => {
	const chatId = msg.chat.id;
	bot.sendMessage(
		chatId,
		`TUBot Help:
		start - Display welcome message
		ping - Check if bot is online
		help - Display list of commands
		isis - Check if ISIS is online
		shib - Check if Shibboleth is online
		moses - Check if Moses is online
		all - Check for all services`
	);
});

bot.onText(/\/ping/, (msg, match) => {
	const chatId = msg.chat.id;
	bot.sendMessage(chatId, "Pong!");
});

bot.onText(/\/echo (.+)/, (msg, match) => {
	const chatId = msg.chat.id;
	const resp = match[1];
	if (msg.from.id != "1992870418") return false;
	bot.sendMessage(chatId, resp);
	// bot.sendMessage(chatId, JSON.stringify(match, null, 2));
});

bot.onText(/\/debug/, (msg, match) => {
	const chatId = msg.chat.id;
	bot.sendMessage(chatId, "Debug sent to PM!");
	bot.sendMessage(
		msg.from?.id || chatId,
		msg.from?.id ? JSON.stringify(msg, null, 2) : "Error!"
	);
});

bot.onText(/\/isis/, async (msg, match) => {
	const chatId = msg.chat.id;
	const res = await isOnline("https://isis.tu-berlin.de");
	const ok = res?.data.includes("Willkommen auf ISIS") && res?.status === 200;
	bot.sendMessage(chatId, `ISIS is ${ok ? "online" : "offline"}`);
});

bot.onText(/\/shib/, async (msg, match) => {
	const chatId = msg.chat.id;
	const res = await isOnline(
		"https://shibboleth.tubit.tu-berlin.de/idp/profile/SAML2/Redirect/SSO"
	);
	const ok = res?.data.includes("Web Login Service - Stale Request");
	bot.sendMessage(chatId, `Shibboleth is ${ok ? "online" : "offline"}`);
});

bot.onText(/\/moses/, async (msg, match) => {
	const chatId = msg.chat.id;
	const res = await isOnline("https://moseskonto.tu-berlin.de");
	const ok = res?.data.includes("Willkommen bei Moses") && res?.status === 200;
	bot.sendMessage(chatId, `Moses is ${ok ? "online" : "offline"}`);
});

// bot.onText(/\/autolab/, async (msg, match) => {
// 	const chatId = msg.chat.id;
// 	const res = await isOnline("https://autolab.service.tu-berlin.de");
// 	console.log(res);
// 	bot.sendMessage(chatId, `${res}`);
// });

bot.onText(/\/all/, async (msg, match) => {
	const chatId = msg.chat.id;
	const res = await isOnline("https://isis.tu-berlin.de");
	const isis = res?.data.includes("Willkommen auf ISIS") && res?.status === 200;
	const res2 = await isOnline(
		"https://shibboleth.tubit.tu-berlin.de/idp/profile/SAML2/Redirect/SSO"
	);
	const shib = res2?.data.includes("Web Login Service - Stale Request");
	const res3 = await isOnline("https://moseskonto.tu-berlin.de");
	const moses =
		res3?.data.includes("Willkommen bei Moses") && res3?.status === 200;
	// const res4 = await isOnline("https://autolab.service.tu-berlin.de");
	// const autolab = res4?.status === 200;
	bot.sendMessage(
		chatId,
		`Checking all services:
	ISIS is ${isis ? "online" : "offline"}
	Shibboleth is ${shib ? "online" : "offline"}
	Moses is ${moses ? "online" : "offline"}`
	);
});
