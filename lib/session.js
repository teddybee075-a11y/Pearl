const fs = require('fs')
module.exports.Session = {
  async restore(sessionId, sessionPath) {
    try {
      const b64 = sessionId.split("PEARL~")[1] || sessionId.split("~")[1] || sessionId
      const json = Buffer.from(b64, 'base64').toString()
      const creds = JSON.parse(json)
      if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })
      fs.writeFileSync(`${sessionPath}/creds.json`, JSON.stringify(creds, null, 2))
      console.log("✅ PEARL Session Restored")
    } catch (e) {
      console.log("Session Error:", e.message)
    }
  }
}
