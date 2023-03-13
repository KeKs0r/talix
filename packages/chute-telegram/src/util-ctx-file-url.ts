import { Context, MiddlewareFn } from 'grammy/web'

export type FileUrlPluginFlavor = {
    getFileLink(filePath: string): string
}

export function fileUrlMiddleware<C extends Context>(
    token: string
): MiddlewareFn<C & FileUrlPluginFlavor> {
    return async (ctx, next) => {
        // Modify context object here by setting the config.
        ctx.getFileLink = (filePath: string) => {
            return `https://api.telegram.org/file/bot${token}/${filePath}`
        }
        // Run remaining handlers.
        await next()
    }
}
