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

// إعداد بوت الدسكورد
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
  ],
});

let attendanceList = [];

client.on('ready', () => {
  console.log(`🟢 بوت الحضور جاهز: ${client.user.tag}`);

  // إرسال زر الحضور تلقائيًا (اختياري)
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
          .setCustomId('show_list')
          .setLabel('عرض الحضور 📋')
          .setStyle(ButtonStyle.Primary)
      );

    channel.send({
      content: '**اضغط على الأزرار لإدارة الحضور:**',
      components: [row],
    });
  }
});

// نفس كود البوت السابق (التفاعل مع الأزرار)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const user = interaction.user.username;

  if (interaction.customId === 'check_in') {
    if (!attendanceList.includes(user)) {
      attendanceList.push(user);
      await interaction.reply({
        content: `✅ **${user}** تم تسجيل دخولك!`,
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
    if (attendanceList.includes(user)) {
      attendanceList = attendanceList.filter(u => u !== user);
      await interaction.reply({
        content: `❌ **${user}** تم تسجيل خروجك!`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '⚠️ لم يتم تسجيل دخولك بعد!',
        ephemeral: true,
      });
    }
  }

  if (interaction.customId === 'show_list') {
    const embed = new EmbedBuilder()
      .setTitle('📊 قائمة الحضور')
      .setDescription(attendanceList.length > 0 ? `**${attendanceList.join('\n')}**` : 'لا يوجد أحد حاضر حالياً!')
      .setColor('#00FF00');

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
});

// تشغيل البوت
client.login(process.env.TOKEN); // التوكن من متغيرات البيئة
