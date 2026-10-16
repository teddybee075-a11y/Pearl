const fs = require('fs')
const path = require('path')
const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason } = require("@whiskeysockets/baileys")
const P = require("pino")
const { Session } = require('./lib/session')

if (fs.existsSync('./config.env')) require('dotenv').config({ path: './config.env' })

const SESSION_ID = process.env.SESSION_ID
const PREFIX = process.env.PREFIX || "."
const OWNER_NUMBER = process.env.OWNER_NUMBER || "2348100000000"
const SESSION_FOLDER = "pearl_session"

global.plugins = new Map()

// Load Plugins like Levanter
const pluginFolder = path.join(__dirname, 'plugins')
if (!fs.existsSync(pluginFolder)) fs.mkdirSync(pluginFolder)
fs.readdirSync(pluginFolder).forEach(f => {
  if (f.endsWith('.js')) {
    try {
      const plug = require(path.join(pluginFolder, f))
      if (plug.name) {
        global.plugins.set(plug.name, plug)
        console.log(`[PEARL] Loaded: ${plug.name}`)
      }
    } catch(e){ console.log(`Failed ${f}: ${e.message}`) }
  }
})

async function startPearl() {
  if (SESSION_ID) {
    console.log("[PEARL] Decoding SESSION_ID...")
    await Session.restore(SESSION_ID, `./${SESSION_FOLDER}`)
  }

  const { state, saveCreds } = await useMultiFileAuthState(`./${SESSION_FOLDER}`)
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    browser: Browsers.ubuntu("Pearl-MD"),
  })
  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", (up) => {
    const { connection, lastDisconnect } = up
    if (connection === "open") console.log("✅ Pearl-MD Connected")
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) startPearl()
      else console.log("Logged out - delete pearl_session and re-pair")
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m?.message || m.key.fromMe) return
    const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ""
    if (!body.startsWith(PREFIX)) return

    const args = body.slice(PREFIX.length).trim().split(/ +/)
    const command = args.shift().toLowerCase()
    const plugin = global.plugins.get(command)

    if (plugin) {
      try {
        await plugin.run(sock, m, { args, text: args.join(" "), prefix: PREFIX, owner: OWNER_NUMBER })
      } catch(e) {
        await sock.sendMessage(m.key.remoteJid, { text: `❌ Error: ${e.message}` })
      }
    }
  })
}

startPearl()
