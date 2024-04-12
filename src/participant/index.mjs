import { MongoDBAdapter } from '@grammyjs/storage-mongodb'
import { Composer, InlineKeyboard, session } from 'grammy'
import { participants as collection, sessions } from '../db.mjs'

const defaults = { format: 'static', emoji_list: ['✨'] }

export const composer = new Composer()

const privateChats = composer.errorBoundary(console.error).chatType('private')

privateChats.use(
  session({
    storage: new MongoDBAdapter({ collection }),
    initial: () => ({ registered: new Date(), bots: {} }),
  })
)

privateChats.use((ctx, next) =>
  next((ctx.session.bots[ctx.me.username] = new Date()))
)

privateChats.command('start', async (ctx, next) => {
  const _id = ctx.match.trim()
  if (!_id) return next()
  const date = new Date()
    .toLocaleString('ru', { dateStyle: 'short' })
    .replaceAll('.', '_')
  const title = 'Stickers by @DiventDigital'
  const name = `${date}_for_${ctx.chat.id}_by_${ctx.me.username}`
  const { href } = new URL(name, 'https://t.me/addstickers/')
  const session = await sessions.findOneAndDelete({ _id })
  const stickers = session.stickers.map(sticker => ({ ...defaults, sticker }))
  await ctx.api.createNewStickerSet(ctx.chat.id, name, title, stickers)
  await ctx.reply(`Стикеров загружено в ваш набор: ${stickers.length}`, {
    reply_markup: new InlineKeyboard()
      .url('Добавить набор', href)
      .text('Инструкция', 'help')
      .toFlowed(1),
  })
})

privateChats.callbackQuery('help', ctx =>
  ctx.reply(`
Стикеры могут появляться в наборе с задержкой, если вы не видите новых изображений, попробуйте перезапустить приложение.
Если вы хотите удалить стикеры или весь набор, для этого перейдите в бота @Stickers и выберите соответствующий пункт в меню.
`)
)

privateChats.on('message:text', ctx =>
  ctx.reply(`Добро пожаловать в бота @${ctx.me.username}!`)
)
