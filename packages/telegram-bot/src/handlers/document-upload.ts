import { diary } from 'diary'
import { Composer } from 'grammy'

const logger = diary('telegram:document:upload')

const documentUpload = new Composer()
documentUpload.on('message:document', async (ctx) => {
    logger.debug('started')
    const document = ctx.update.message.document
    const fileName = document.file_name

    await ctx.reply('Implement me')
})

export default documentUpload
