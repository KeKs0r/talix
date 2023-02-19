import { telegramPlugin as createTelegramPlugin } from './chute-telegram/telegram-plugin'
import { DocumentUploadAction } from './handlers/document'
export const telegramPlugin = createTelegramPlugin([DocumentUploadAction])
