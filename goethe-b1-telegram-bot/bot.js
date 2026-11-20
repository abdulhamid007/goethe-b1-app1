require('dotenv').config();
const express = require('express');
const path = require('path');
const { Telegraf, Markup } = require('telegraf');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const BOT_TOKEN = process.env.BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const WEBAPP_URL = process.env.WEBAPP_URL;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN || !GEMINI_API_KEY) {
  console.error("XATO: .env faylida BOT_TOKEN va GEMINI_API_KEY ni kiriting!");
  process.exit(1);
}

const app = express();
const bot = new Telegraf(BOT_TOKEN);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  systemInstruction: "Sen nemis tili B1 (Goethe-Zertifikat B1, Module B1 Testbuch) bo'yicha o'qituvchi va imtihonchi AI yordamchisan. O'zbek va nemis tillarida javob ber, xatlarni tekshir, gapirish mashqida suhbatdosh bo'l."
});

app.use(express.static(path.join(__dirname)));

bot.start((ctx) => {
  const buttons = [];
  if (WEBAPP_URL && WEBAPP_URL.startsWith('https://')) {
    buttons.push([Markup.button.webApp('🎓 B1 Imtihon & Lug‘at Ilovasini Ochish', WEBAPP_URL)]);
  }
  buttons.push([Markup.button.callback('✍️ Schreiben tekshirtirish', 'help_schreiben')]);
  buttons.push([Markup.button.callback('🗣️ Sprechen mashqi', 'help_sprechen')]);

  ctx.reply(
    `Assalomu alaykum, ${ctx.from.first_name}! 🇩🇪\n\n` +
    `*Goethe-Zertifikat B1 (Module B1 Testbuch)* botiga xush kelibsiz!\n\n` +
    `• Tugma orqali to'liq imtihon simulyatorini ochishingiz mumkin.\n` +
    `• Yoki shu yerga nemischa xat/savol yozing — *Gemini AI* tekshirib beradi!`,
    { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) }
  );
});

bot.on('web_app_data', async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    if (data.type === 'exam_result') {
      const lines = data.scores.map(s => `${s.passed ? '✅' : '❌'} ${s.name}: *${s.score}%*`).join('\n');
      const statusText = data.allPassed
        ? "🎉 *Tabriklaymiz! Siz B1 darajasidan o'tdingiz!*"
        : "⚠️ *Qayta urinib ko'ring, darajangiz B1 emas!* (Har bir bo'limdan kamida 60% kerak)";
      await ctx.reply(`📊 *Einheit ${data.einheit} Natijasi:*\n\n${lines}\n\n${statusText}`, { parse_mode: 'Markdown' });
    }
  } catch (err) { console.error(err); }
});

bot.action('help_schreiben', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply("✍️ Nemis tilida yozgan xatingizni shu yerga yuboring, men tekshirib baholab beraman!");
});

bot.action('help_sprechen', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply("🗣️ Sprechen mavzusini yozing — men siz bilan nemis tilida suhbatlashaman!");
});

bot.on('text', async (ctx) => {
  try {
    await ctx.sendChatAction('typing');
    const result = await model.generateContent(ctx.message.text);
    await ctx.reply(result.response.text());
  } catch (error) {
    console.error(error);
    await ctx.reply("AI javob berishda xatolik yuz berdi.");
  }
});

app.listen(PORT, () => console.log(`🌐 Server http://localhost:${PORT} da ishga tushdi`));
bot.launch().then(() => console.log("🤖 Telegram Bot + Gemini AI ishga tushdi!"));