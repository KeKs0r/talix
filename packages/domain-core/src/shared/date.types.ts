import type { DateTimeString } from './base-schema'
declare global {
    interface Date {
        constructor(input: DateTimeString): Date
        toISOString(): DateTimeString
    }
}
