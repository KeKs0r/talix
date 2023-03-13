import { diary } from 'diary'
import { Composer } from 'grammy/web'
import ok from 'tiny-invariant'
import { type BotContext } from '@chute/telegram'
import { uploadDocumentFromUrlAction } from 'domain-core'

const logger = diary('telegram:document:upload')

const documentUpload = new Composer<BotContext>()
documentUpload.on('message:document', async (ctx) => {
    logger.debug('started')

    const document = ctx.update.message.document
    const fileName = document.file_name
    ok(fileName, 'filename missing')
    const file = await ctx.getFile()
    ok(file.file_path, 'file_path missing')

    const url = ctx.getFileLink(file.file_path)

    logger.info('filename', fileName)
    logger.info('url', url)
    logger.info('unique id', file.file_unique_id)
    logger.info('file id', file.file_id)
    logger.info('mime_type', document.mime_type)
    // logger.info('path', file.path)
    if (!document.mime_type) {
        logger.warn('Cant upload without mime_type')
        await ctx.reply('No mime type on file')
        return
    }

    const result = await ctx.cradle.runAction(uploadDocumentFromUrlAction, {
        url,
        fileName,
        hash: document.file_unique_id,
        mimeType: document.mime_type,
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
})

export default documentUpload
