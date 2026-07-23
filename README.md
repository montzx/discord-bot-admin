# Discord Admin Bot

Bot Discord profesional, modular, scalable, dan efisien yang dibangun menggunakan **Node.js 22**, **Discord.js v14**, dan **SQLite (`better-sqlite3`)**.

Bot ini dirancang khusus untuk server pribadi (*private server*) dengan seluruh Slash Command dibatasi hanya untuk **Administrator**.

---

## 🚀 Fitur Utama

1. **📜 Rules System**
   - Setup, Update, Delete, dan Preview Embed Rules.
   - Otomatis membuat ulang embed jika terhapus dari channel secara manual.

2. **📌 Sticky Message System**
   - Menjaga pesan penting (Rules, Pengumuman, Event, Informasi) selalu berada di urutan paling bawah channel.
   - Dilengkapi sistem cooldown anti-spam dan penyimpanan ID ke SQLite.

3. **👋 Welcome System**
   - Menyapa member baru dengan Embed yang modern.
   - Mendukung placeholder variabel (`{user}`, `{server}`, `{memberCount}`, `{rules}`).

4. **📋 Log System Sangat Lengkap**
   - **Member**: Join, Leave, Ban, Unban, Kick, Timeout, Timeout Removed.
   - **Message**: Message Deleted, Message Edited, Attachment Deleted.
   - **Voice**: Join Voice, Leave Voice, Move Voice, Server Mute, Server Unmute, Deafen.
   - **Server**: Channel (Created/Deleted/Updated), Role (Created/Deleted/Updated), Emoji (Created/Deleted/Updated), Thread (Created/Deleted).
   - **Administrator Audit Logs**: Melacak executor (Admin) pada aksi sensitif (Ban, Kick, Hapus Channel/Role, Timeout).

5. **⚙️ Config Command**
   - Menampilkan seluruh ringkasan konfigurasi bot, status SQLite, latency, versi Node & Discord.js.

6. **🛠️ Utility Commands**
   - `/ping`, `/botinfo`, `/serverinfo`.

7. **🔒 Administrator Security**
   - Seluruh slash command hanya muncul dan dapat dijalankan oleh user yang memiliki hak akses `Administrator`.

---

## 🛠️ Persyaratan System

- **Node.js**: v22.0.0 atau lebih baru
- **NPM**: v10.0.0 atau lebih baru

---

## 🚀 Cara Penggunaan Lokal

1. **Clone & Install Dependencies**
   ```bash
   git clone <repository_url>
   cd discord-admin-bot
   npm install
   ```

2. **Konfigurasi Environment**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Isi variabel berikut:
   - `DISCORD_TOKEN`: Token bot dari [Discord Developer Portal](https://discord.com/developers/applications).
   - `CLIENT_ID`: ID Aplikasi/Bot Discord Anda.
   - `GUILD_ID`: ID Server Discord pribadi Anda.

3. **Pastikan Privileged Gateway Intents Aktif**
   Di Discord Developer Portal -> Application -> Bot -> **Privileged Gateway Intents**:
   - ✅ **PRESENCE INTENT**
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **MESSAGE CONTENT INTENT**

4. **Jalankan Bot**
   ```bash
   npm start
   ```

---

## ☁️ Deployment ke Render Web Service

1. Push repository ke GitHub.
2. Buat **Web Service** baru di [Render](https://render.com/).
3. Hubungkan repository GitHub Anda.
4. Render akan otomatis membaca file `render.yaml` atau isi variabel environment berikut di dashboard Render:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID`
   - `NODE_ENV=production`
5. Pilih **Build Command**: `npm install` dan **Start Command**: `npm start`.

---

## 📁 Struktur Project

```
src/
├── commands/
│   ├── rules/
│   ├── sticky/
│   ├── welcome/
│   ├── logs/
│   ├── config/
│   └── utility/
├── events/
│   ├── client/
│   ├── guild/
│   ├── message/
│   └── interaction/
├── handlers/
│   ├── commandHandler.js
│   └── eventHandler.js
├── database/
│   ├── database.js
│   └── schema.js
├── utils/
│   ├── logger.js
│   ├── auditLog.js
│   └── stickyHandler.js
├── embeds/
│   └── embedBuilder.js
├── config.js
└── index.js
```
