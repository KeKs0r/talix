import ok from 'tiny-invariant'
import { diary } from 'diary'
import { Markup, message } from 'telegraf-light'
import { uploadDocumentFromUrlAction } from 'domain-core'

import { TelegramAction } from '../chute-telegram/telegram-action'

const logger = diary('telegram:document:upload')

const filter = message('document')

export const DocumentUploadAction = new TelegramAction({
    actionId: 'telegram:document:upload',
    filter,
    async handler(ctx, deps) {
        logger.debug('started')
        const document = ctx.update.message.document
        const fileName = document.file_name
        ok(fileName, 'filename missing')
        const url = await ctx.telegram.getFileLink(document.file_id)
        const link = url.href
        logger.info('filename', fileName)
        logger.info('url', link)
        logger.info('unique id', document.file_unique_id)
        logger.info('file id', document.file_id)

        debugger
        const result = await deps.runAction(uploadDocumentFromUrlAction, {
            url: link,
            fileName,
            hash: document.file_unique_id,
        })
        logger.info('result', result)
        await ctx.reply('Document uploaded')

        // ctx.reply(
        //     'What kind of document?',
        //     Markup.keyboard([
        //         ['🤑 Invoice', '📄 Receipt'], // Row1 with 2 buttons
        //     ])
        //         .oneTime()
        //         .resize()
        // )
    },
})
