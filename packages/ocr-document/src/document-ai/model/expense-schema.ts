import { date, z } from 'zod'

export const ExpenseFieldNames = z.enum([
    'credit_card_last_four_digits',
    'currency',
    'end_date',
    'net_amount',
    'payment_type',
    'purchase_time',
    'receipt_date',
    'start_date',
    'supplier_address',
    'supplier_city',
    'supplier_name',
    'tip_amount',
    'total_amount',
    'total_tax_amount',
    'line_item',
    'line_item/amount',
    'line_item/description',
    'line_item/product_code',
    'line_item/quantity',
])

export const BaseEntitySchema = z.object({
    textAnchor: z.unknown(),
    // type: ExpenseFieldNames,
    mentionText: z.string().optional(),
    confidence: z.number().min(0).max(1),
    pageAnchor: z.unknown(),
    id: z.string(),
})

export const DateFieldNameSchema = z.enum(['receipt_date', 'end_date', 'start_date'])
type DateFieldName = z.infer<typeof DateFieldNameSchema>
export const DateEntitySchema = BaseEntitySchema.extend({
    type: DateFieldNameSchema,
    normalizedValue: z.object({
        text: z.string(),
        dateValue: z.object({
            year: z.number(),
            month: z.number(),
            day: z.number(),
        }),
    }),
})
export type DateEntity = z.infer<typeof DateEntitySchema>

export function getDateEntity(
    entities: ExpenseEntity[],
    fieldName: DateFieldName
): DateEntity | undefined {
    const dateEntities = entities.filter(isDateEntity)
    const dateEntity = dateEntities.find((e) => e.type === fieldName)
    return dateEntity
}

function isDateEntity(entity: ExpenseEntity): entity is DateEntity {
    return (
        entity.type === 'receipt_date' || entity.type === 'end_date' || entity.type === 'start_date'
    )
}

export const TextFieldNameSchema = z.enum(['supplier_name', 'supplier_address', 'supplier_city'])
export const TextEntitySchema = BaseEntitySchema.extend({
    type: TextFieldNameSchema,
})

export const TimeFieldNameSchema = z.enum(['purchase_time'])
export const TimeEntitySchema = BaseEntitySchema.extend({
    type: TimeFieldNameSchema,
    normalizedValue: z.object({
        text: z.string().optional(),
        datetimeValue: z.object({
            hours: z.number(),
            minutes: z.number(),
            seconds: z.number(),
        }),
    }),
})

// export function getTimeEntity(entities: ExpenseEntities[], fieldName: TimeFields) {
//     return entities.find((a) => a.type === fieldName) as TimeEntity | undefined
// }

const CurrencyValueFieldNameSchema = z.enum([
    'total_amount',
    'net_amount',
    'tip_amount',
    'total_tax_amount',
    'line_item/amount',
])

export const CurrencyValueEntitySchema = BaseEntitySchema.extend({
    type: CurrencyValueFieldNameSchema,
    normalizedValue: z.object({
        text: z.string(),
        moneyValue: z.object({
            units: z.string(), // number
        }),
    }),
})

const CurrencyUnitFieldNameSchema = z.enum(['currency'])
const CurrencyUnitEntitySchema = BaseEntitySchema.extend({
    type: CurrencyUnitFieldNameSchema,
    normalizedValue: z
        .object({
            text: z.literal('EUR').or(z.string()),
        })
        .optional(),
})

const LineItemFieldNameSchema = z.enum([
    'line_item/description',
    'line_item/amount',
    'line_item/product_code',
    'line_item/quantity',
])
export const LineItemPropertyEntitySchema = BaseEntitySchema.extend({
    type: LineItemFieldNameSchema,
})

const LineItemEntitySchema = BaseEntitySchema.extend({
    type: z.enum(['line_item']),
    properties: z.array(LineItemPropertyEntitySchema),
})

export const EntitySchema = z.discriminatedUnion('type', [
    DateEntitySchema,
    TextEntitySchema,
    TimeEntitySchema,
    CurrencyValueEntitySchema,
    LineItemEntitySchema,
    CurrencyUnitEntitySchema,
])

export type ExpenseEntity = z.infer<typeof EntitySchema>
