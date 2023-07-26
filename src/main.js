import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import config from "config";
import { ogg } from "./ogg.js";
import { openAi } from "./openai.js";

// ---------- Session ---------- //

const INITIAL_SESSION = {
  messages: [],
};

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.use(session());

bot.command("start", async (ctx) => {
  ctx.session = INITIAL_SESSION;
  await ctx.reply("Жду вашего сообщения ");
});

// ---------- Chatting with GPT ---------- //

bot.on(message("text"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION; // Check Session
  try {
    const userMsg = ctx.message.text; // User message
    ctx.session.messages.push({ role: openAi.roles.USER, content: userMsg }); // add msg to session

    const gptReply = await openAi.chat(ctx.session.messages); // gpt response

    ctx.session.messages.push({
      role: openAi.roles.ASSISTANT,
      content: gptReply.content,
    }); // add gpt msg to session

    ctx.reply(gptReply.content); // response to user
  } catch (error) {
    console.log("Error chatting with GPT", error.message);
  }
});

// ---------- Voices ---------- //

bot.on(message("voice"), async (ctx) => {
  ctx.session ??= INITIAL_SESSION; // Check Session
  try {
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id); // get user voice link
    const userId = String(ctx.message.from.id);

    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    const textVoice = await openAi.transcription(mp3Path); // transcription from openai

    ctx.session.messages.push({ role: openAi.roles.USER, content: textVoice }); // add msg to session

    const gptReply = await openAi.chat(ctx.session.messages); // gpt response

    ctx.session.messages.push({
      role: openAi.roles.ASSISTANT,
      content: gptReply.content,
    }); // add gpt msg to session

    await ctx.reply(gptReply.content); // response to user
  } catch (e) {
    console.log("Error while voice message", e.message);
  }
});

bot.launch();

// ---------- Enable graceful stop ---------- //

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
