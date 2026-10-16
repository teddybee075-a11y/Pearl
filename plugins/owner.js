module.exports = {
  name: "owner",
  desc: "Owner info",
  run: async (sock, m, { owner }) => {
    await sock.sendMessage(m.key.remoteJid, { text: `👑 *PEARL Owner*\nwa.me/${owner}\nBot: Pearl-MD` })
  }
}
