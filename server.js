const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const path = require('path')

const app = express()
const PORT = 3000

app.use(express.static(path.join(__dirname, 'public')))

app.get('/cek/:username', async (req, res) => {
  const username = req.params.username
  try {
    // Step 1: Dapatkan ID pengguna dari username
    const getId = await axios.get(`https://api.roblox.com/users/get-by-username?username=${username}`)
    if (!getId.data.Id) return res.json({ error: "Username tidak ditemukan" })
    const userId = getId.data.Id

    // Step 2: Scrape profil
    const profileUrl = `https://www.roblox.com/users/${userId}/profile`
    const { data: html } = await axios.get(profileUrl)
    const $ = cheerio.load(html)
    const text = $('body').text()

    // Step 3: Cek apakah sedang online
    const isOnline = text.includes("Currently Online") || text.includes("Currently Playing")
    const gameMatch = text.match(/Currently Playing:\s(.+?)\\n/)

    res.json({
      username,
      userId,
      online: isOnline,
      playing: gameMatch ? gameMatch[1] : null
    })
  } catch (e) {
    console.error(e.message)
    res.json({ error: "Terjadi kesalahan atau user tidak ditemukan" })
  }
})

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`)
})
