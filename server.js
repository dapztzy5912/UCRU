// server.js
import express from 'express'
import axios from 'axios'
import cheerio from 'cheerio'
const app = express()

app.get('/cek/:username', async (req, res) => {
  const username = req.params.username
  try {
    // Cari userId dari username
    const userRes = await axios.get(`https://api.roblox.com/users/get-by-username?username=${username}`)
    const userId = userRes.data.Id
    const profileUrl = `https://www.roblox.com/users/${userId}/profile`

    const { data } = await axios.get(profileUrl)
    const $ = cheerio.load(data)
    const text = $('body').text()

    const isOnline = text.includes('Currently Online') || text.includes('Currently Playing')
    const gameMatch = text.match(/Currently Playing: (.+?)\\n/)

    res.json({
      username,
      online: isOnline,
      game: gameMatch ? gameMatch[1] : null
    })
  } catch (err) {
    res.json({ error: 'Username tidak ditemukan atau error.' })
  }
})

export default app
