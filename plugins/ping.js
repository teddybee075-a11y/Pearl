module.exports = {
  name: "ping",
  desc: "Check bot speed",
  run: async (sock, m) => {
    const start = Date.now()
    await sock.sendMessage(m.key.remoteJid, { text: "Checking..." }, { quoted: m })
    await sock.sendMessage(m.key.remoteJid, { text: `*Pong!* ${Date.now()-start}ms\nPearl-MD ⚡️` })
  }
}
