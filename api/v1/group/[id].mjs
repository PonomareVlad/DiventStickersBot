import { kv } from '@vercel/kv'
import { StickersBot } from '../../../src/stickers.mjs'

export const config = { runtime: 'edge' }

export const POST = async req => {
  const bot = await StickersBot.fromRequest(req)
  const [images = []] = await Promise.all([req.json(), bot.init()])
  console.debug(images)
  if (!images.length) throw new Error('Empty images')
  const id = /** @type string */ req.headers.get('x-vercel-id').split(':').pop()
  const url = new URL(bot.botInfo.username, 'https://t.me')
  url.searchParams.set('start', id)
  await kv.lpush(id, ...images)
  await kv.expire(id, 60 * 60)
  console.debug(url.href)
  return Response.json({ url })
}
