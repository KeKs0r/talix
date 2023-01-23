import { Telegraf, Markup } from 'telegraf'
import { message } from 'telegraf/filters'

import { App } from '../app/app'

export function registerDocumentHandler(bot: Telegraf, app: App) {
    bot.on(message('document'), async (ctx) => {
        const document = ctx.update.message.document

        const url = await ctx.telegram.getFileLink(document.file_id)
        await app.documentService.uploadDocument({
            name: document.file_name,
            url: url.href,
        })

        ctx.reply(
            'What kind of document?',
            Markup.keyboard([
                ['🤑 Invoice', '📄 Receipt'], // Row1 with 2 buttons
            ])
                .oneTime()
                .resize()
        )
    })
}
