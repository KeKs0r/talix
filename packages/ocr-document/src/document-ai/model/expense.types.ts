import { ExpenseResponse } from './document.types'

type FieldNames = ExpenseFieldNames

export type ExpenseFieldNames =
    | 'credit_card_last_four_digits'
    | 'currency'
    | 'end_date'
    | 'net_amount'
    | 'payment_type'
    | 'purchase_time'
    | 'receipt_date'
    | 'start_date'
    | 'supplier_address'
    | 'supplier_city'
    | 'supplier_name'
    | 'tip_amount'
    | 'total_amount'
    | 'total_tax_amount'
    | 'line_item'
    | 'line_item/amount'
    | 'line_item/description'
    | 'line_item/product_code'

export type ExpenseEntities =
    | DateEntity
    | CurrencyUnitEntity
    | CurrencyValueEntity
    | TimeEntity
    | TextEntity
    | LineItemEntity
    | Entity

interface BaseEntity<Type extends FieldNames = FieldNames> {
    textAnchor: unknown
    type: Type
    mentionText: string
    // from 0-1 (apparently)
    confidence: number
    pageAnchor: unknown
    // number as as string
    id: string
}
export interface Entity<
    Type extends FieldNames = FieldNames,
    Value extends { text: string } = { text: string }
> extends BaseEntity<Type> {
    normalizedValue: Value
}

export type DateFields = 'receipt_date' | 'end_date' | 'start_date'
export type DateEntity = Entity<
    DateFields,
    {
        text: string
        dateValue: {
            year: number
            month: number
            day: number
        }
    }
>
export function getDateEntity(entities: ExpenseEntities[], fieldName: DateFields) {
    return entities.find((a) => a.type === fieldName) as DateEntity | undefined
}

export type TextEntity = Entity<'supplier_name' | 'supplier_address' | 'supplier_city'>

export type TimeFields = 'purchase_time'
export type TimeEntity = Entity<
    'purchase_time',
    {
        text: string
        datetimeValue: {
            hours: number
            minutes: number
            seconds: number
        }
    }
>
export function getTimeEntity(entities: ExpenseEntities[], fieldName: TimeFields) {
    return entities.find((a) => a.type === fieldName) as TimeEntity | undefined
}

type CurrencyUnitEntity = Entity<
    'currency',
    {
        text: 'EUR' | string
    }
>
type CurrencyValueEntity = Entity<
    'total_amount' | 'net_amount' | 'tip_amount' | 'total_tax_amount' | 'line_item/amount',
    {
        text: string
        moneyValue: {
            units: string // string number
        }
    }
>

interface LineItemEntity extends BaseEntity<'line_item'> {
    properties: BaseEntity<'line_item/description' | 'line_item/amount' | 'line_item/product_code'>
}
