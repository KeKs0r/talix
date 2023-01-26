import { DateStringSchema, DateTimeString } from './base-schema'
declare global {
    interface Date {
        constructor(input: DateTimeString): Date
        toISOString(): DateTimeString
    }
}

export function createDateString(year: number, month: number, day: number) {
    return DateStringSchema.parse(
        `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
    )
}
