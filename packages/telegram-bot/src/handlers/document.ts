import { ok } from 'common'
import { DocumentService } from 'domain-core'
import { Telegraf, Markup } from 'telegraf'
import { message } from 'telegraf/filters'

export function registerDocumentHandler(
    bot: Telegraf,
    { documentService }: { documentService: DocumentService }
) {
    bot.on(message('document'), async (ctx) => {
        const document = ctx.update.message.document
        const fileName = document.file_name
        ok(fileName, 'filename missing')
        const url = await ctx.telegram.getFileLink(document.file_id)
        const link = url.href
        ok(link, 'link missing')
        ok(false, '@TODO FIX THIS')
        await documentService.commands.createDocument.run({
            name: fileName,
            key: 'CHANGE ME',
            documentId: 'CHANGE ME',
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
