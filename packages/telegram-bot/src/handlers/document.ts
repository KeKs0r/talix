import { ok } from 'common'
import { Markup, message } from 'telegraf-light'

import { TelegramAction } from '../chute-telegram/telegram-action'

export const DocumentUploadAction = new TelegramAction({
    actionId: 'telegram:document:upload',
    filter: message('document'),
    async handler(ctx, deps) {
        const document = ctx.update.message.document
        const fileName = document.file_name
        ok(fileName, 'filename missing')
        const url = await ctx.telegram.getFileLink(document.file_id)
        const link = url.href
        console.log('url', url)

        ctx.reply(
            'What kind of document?',
            Markup.keyboard([
                ['🤑 Invoice', '📄 Receipt'], // Row1 with 2 buttons
            ])
                .oneTime()
                .resize()
        )
    },
})
