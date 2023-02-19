import { telegramPlugin as createTelegramPlugin } from './chute-telegram/telegram-plugin'
import { DocumentUploadAction } from './handlers/tg-document'
export const telegramPlugin = createTelegramPlugin([DocumentUploadAction])
