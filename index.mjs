#!/usr/bin/env node

import meow from 'meow'
import { createReadStream } from 'node:fs'

const { input = [] } = meow({ importMeta: import.meta })

const { API_URL = 'https://divent-stickers-bot.vercel.app/', ID = 12345 } =
  process.env

const api = {
  image: new URL(`api/v1/image/${ID}`, API_URL),
  group: new URL(`api/v1/group/${ID}`, API_URL),
}

const images = await Promise.all(
  input.map(async path => {
    try {
      const stream = createReadStream(path)
      const body = ReadableStream.from(stream.iterator())
      const response = await fetch(api.image, {
        method: 'POST',
        duplex: 'half',
        body,
      })
      const { file_id } = await response.json()
      return file_id
    } catch {}
  })
)

const response = await fetch(api.group, {
  body: JSON.stringify(images.filter(Boolean)),
  method: 'POST',
})

const { url } = await response.json()

console.log(url)
