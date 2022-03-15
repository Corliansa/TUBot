const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true, onlyFirstMatch: true });

const onlineText = "Online ✅";
const offlineText = "Offline ❌";

const getStatus = (on) => {
	return on ? onlineText : offlineText;
};

const isOnline = async (url) => {
	try {
		const res = await axios.get(url, { timeout: 5000 });
		return res;
	} catch (err) {
		return err.response;
	}
};

const isis = async () => {
	const res = await isOnline("https://isis.tu-berlin.de");
	const ok = res?.data?.includes("Willkommen auf ISIS") && res?.status === 200;
	return ok;
};

const shib = async () => {
	const res = await isOnline(
		"https://shibboleth.tubit.tu-berlin.de/idp/profile/SAML2/Redirect/SSO"
	);
	const ok = res?.data?.includes("Web Login Service - Stale Request");
	return ok;
};

const moses = async () => {
	const res = await isOnline("https://moseskonto.tu-berlin.de");
	const ok = res?.data?.includes("Willkommen bei Moses") && res?.status === 200;
	return ok;
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
	bot.sendMessage(chatId, `ISIS is ${getStatus(await isis())}`);
});

bot.onText(/\/shib/, async (msg, match) => {
	const chatId = msg.chat.id;
	bot.sendMessage(chatId, `Shibboleth is ${getStatus(await shib())}`);
});

bot.onText(/\/moses/, async (msg, match) => {
	const chatId = msg.chat.id;
	bot.sendMessage(chatId, `Moses is ${getStatus(await moses())}`);
});

bot.onText(/\/check (.+)/, async (msg, match) => {
	const chatId = msg.chat.id;
	const resp = match[1];
	axios
		.get(resp, {
			timeout: 5000,
		})
		.then(function (response) {
			// console.log(response);
			bot.sendMessage(chatId, getStatus(true));
		})
		.catch(function (error) {
			// console.error(error);
			bot.sendMessage(chatId, `${getStatus(false)}: ${error?.message}`);
		});
});

bot.onText(/\/all/, async (msg, match) => {
	const chatId = msg.chat.id;
	bot.sendMessage(
		chatId,
		`Checking all services:
	ISIS is ${getStatus(await isis())}
	Shibboleth is ${getStatus(await shib())}
	Moses is ${getStatus(await moses())}`
	);
});
