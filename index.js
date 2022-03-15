const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
require("dotenv").config();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true, onlyFirstMatch: true });

const lastChat = {};

const setLastChat = (chatId, messageId) => {
	Object.assign(lastChat, { [chatId]: messageId });
};

const clearLastChat = async (chatId) => {
	lastChat[chatId] &&
		(await bot.deleteMessage(chatId, lastChat[chatId]).catch(() => {}));
};

const chatClearer = async (chatId, messageId = lastChat[chatId]) => {
	if (!messageId) return;
	for (let i = 0; i < 100; i++) {
		await bot.deleteMessage(chatId, messageId - i).catch(() => {});
		if (messageId - i == 0) return;
	}
};

const onlineText = "Online ✅";
const offlineText = "Offline ❌";

const getStatus = (on) => {
	return on ? onlineText : offlineText;
};

const isOnline = async (url) => {
	try {
		const res = await axios(url, { timeout: 5000 });
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
	clearLastChat(chatId);
	bot
		.sendMessage(
			chatId,
			"Hello!\nI'm a bot created by Arniclas.\n\nTo start, please, type /help to see the list of commands."
		)
		.then((message) => {
			setLastChat(chatId, message.message_id);
		});
});

bot.onText(/\/help/, (msg, match) => {
	const chatId = msg.chat.id;
	clearLastChat(chatId);
	bot
		.sendMessage(
			chatId,
			`TUBot Help:
		/start - Display welcome message
		/ping - Check if bot is online
		/help - Display list of commands
		/isis - Check if ISIS is online
		/shib - Check if Shibboleth is online
		/moses - Check if Moses is online
		/all - Check for all services`
		)
		.then((message) => setLastChat(chatId, message.message_id));
});

bot.onText(/\/ping/, (msg, match) => {
	const chatId = msg.chat.id;
	clearLastChat(chatId);
	bot
		.sendMessage(chatId, "Pong!")
		.then((message) => setLastChat(chatId, message.message_id));
});

bot.onText(/\/echo (.+)/, (msg, match) => {
	const chatId = msg.chat.id;
	clearLastChat(chatId);
	const resp = match[1];
	if (msg.from.id != "1992870418") return false;
	bot
		.sendMessage(chatId, resp)
		.then((message) => setLastChat(chatId, message.message_id));
	// bot.sendMessage(chatId, JSON.stringify(match, null, 2));
});

bot.onText(/\/debug/, (msg, match) => {
	const chatId = msg.chat.id;
	clearLastChat(chatId);
	bot.sendMessage(chatId, "Debug sent to PM!");
	bot
		.sendMessage(
			msg.from?.id || chatId,
			msg.from?.id ? JSON.stringify(msg, null, 2) : "Error!"
		)
		.then((message) => setLastChat(chatId, message.message_id));
});

bot.onText(/\/isis/, async (msg, match) => {
	const chatId = msg.chat.id;
	clearLastChat(chatId);
	bot
		.sendMessage(chatId, `ISIS is ${getStatus(await isis())}`)
		.then((message) => setLastChat(chatId, message.message_id));
});

bot.onText(/\/shib/, async (msg, match) => {
	const chatId = msg.chat.id;
	clearLastChat(chatId);
	bot
		.sendMessage(chatId, `Shibboleth is ${getStatus(await shib())}`)
		.then((message) => setLastChat(chatId, message.message_id));
});

bot.onText(/\/moses/, async (msg, match) => {
	const chatId = msg.chat.id;
	clearLastChat(chatId);
	bot
		.sendMessage(chatId, `Moses is ${getStatus(await moses())}`)
		.then((message) => setLastChat(chatId, message.message_id));
});

bot.onText(/\/check (.+)/, async (msg, match) => {
	const chatId = msg.chat.id;
	clearLastChat(chatId);
	const resp = match[1];
	axios(resp, {
		timeout: 5000,
	})
		.then(function (response) {
			// console.log(response);
			bot
				.sendMessage(chatId, getStatus(true))
				.then((message) => setLastChat(chatId, message.message_id));
		})
		.catch(function (error) {
			// console.error(error);
			bot
				.sendMessage(chatId, `${getStatus(false)}: ${error?.message}`)
				.then((message) => setLastChat(chatId, message.message_id));
		});
});

bot.onText(/\/all/, async (msg, match) => {
	const chatId = msg.chat.id;
	clearLastChat(chatId);
	bot
		.sendMessage(
			chatId,
			`Checking all services:
	ISIS is ${getStatus(await isis())}
	Shibboleth is ${getStatus(await shib())}
	Moses is ${getStatus(await moses())}`
		)
		.then((message) => setLastChat(chatId, message.message_id));
});

bot.onText(/\/clear/, (msg, match) => {
	chatClearer(msg.chat.id, msg.message_id).catch(() => {});
});
