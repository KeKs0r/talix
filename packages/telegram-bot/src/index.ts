import { telegramPlugin as createTelegramPlugin } from './chute-telegram/telegram-plugin'
import { DocumentUploadAction } from './handlers/tg-document'
export type { TelegramPluginContext } from './chute-telegram/telegram-plugin'

export const telegramPlugin = createTelegramPlugin([DocumentUploadAction])
