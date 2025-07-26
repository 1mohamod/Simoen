const express = require('express');
const { Client, IntentsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const app = express();
const PORT = process.env.PORT || 3000;

// إعداد إكسبرس
app.get('/', (req, res) => {
  res.send('✅ البوت يعمل على Render 24/7!');
});

app.listen(PORT, () => {
  console.log(`🖥️ السيرفر يعمل على بورت ${PORT}`);
});
const { Client, IntentsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const client = new Client({ 
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
  ]
});

// تخزين البيانات في ملف JSON
const fs = require('fs');
const path = require('path');
const DATA_PATH = path.join(__dirname, 'attendance.json');

let attendance = [];

// تحميل البيانات عند التشغيل
if (fs.existsSync(DATA_PATH)) {
  attendance = JSON.parse(fs.readFileSync(DATA_PATH));
}

// حفظ البيانات
function saveData() {
  fs.writeFileSync(DATA_PATH, JSON.stringify(attendance, null, 2));
}

client.on('ready', () => {
  console.log(`✅ البوت جاهز: ${client.user.tag}`);

  // إنشاء رسالة الأزرار التلقائية (يمكنك إرسالها يدويًا مرة واحدة)
  const channel = client.channels.cache.get('YOUR_CHANNEL_ID'); // استبدل بـ ID الروم
  if (channel) {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('check_in')
          .setLabel('تسجيل دخول ✅')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('check_out')
          .setLabel('تسجيل خروج ❌')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('show_attendance')
          .setLabel('عرض الحضور 📋')
          .setStyle(ButtonStyle.Primary)
      );

    channel.send({
      content: '**اضغط على الأزرار لإدارة الحضور:**',
      components: [row],
    });
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const user = interaction.user;
  const username = user.username;

  if (interaction.customId === 'check_in') {
    if (!attendance.includes(username)) {
      attendance.push(username);
      saveData();
      await interaction.reply({
        content: `✅ **${username}** تم تسجيل دخولك!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '⚠️ أنت مسجل بالفعل!',
        ephemeral: true,
      });
    }
  }

  if (interaction.customId === 'check_out') {
    if (attendance.includes(username)) {
      attendance = attendance.filter(u => u !== username);
      saveData();
      await interaction.reply({
        content: `❌ **${username}** تم تسجيل خروجك!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '⚠️ لم يتم تسجيل دخولك بعد!',
        ephemeral: true,
      });
    }
  }

  if (interaction.customId === 'show_attendance') {
    const embed = new EmbedBuilder()
      .setTitle('📊 قائمة الحضور')
      .setDescription(attendance.length > 0 ? attendance.join('\n') : 'لا يوجد أحد حاضر حالياً!')
      .setColor('#00FF00');

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
});

client.login('YOUR_BOT_TOKEN'); // استبدل بـ توكن البوت
