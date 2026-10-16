module.exports = {
  name: "menu",
  desc: "Show all commands",
  run: async (sock, m, { prefix }) => {
    let txt = `╭─── *PEARL-MD* ───╮\n│ Prefix: ${prefix}\n│ Plugins: ${global.plugins.size}\n╰───────────────╯\n\n`
    for (let [name, p] of global.plugins) txt += `• ${prefix}${name} - ${p.desc}\n`
    txt += `\n> Pearl by teddybee`
    await sock.sendMessage(m.key.remoteJid, { text: txt }, { quoted: m })
  }
}
