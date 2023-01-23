import { DocumentService } from 'domain-documents'
import { Telegraf, Markup } from 'telegraf'
import { message } from 'telegraf/filters'

export function registerDocumentHandler(
    bot: Telegraf,
    { documentService }: { documentService: DocumentService }
) {
    bot.on(message('document'), async (ctx) => {
        const document = ctx.update.message.document

        const url = await ctx.telegram.getFileLink(document.file_id)
        await documentService.createDocument({
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
