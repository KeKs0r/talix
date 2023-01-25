import pRetry from 'p-retry'
import { ServiceAccount, getJWTFromServiceAccount } from 'cf-gcp-auth'

import { ExpenseResponse } from './model/document.types'

const expenseProcessor =
    'https://eu-documentai.googleapis.com/v1/projects/516092020166/locations/eu/processors/d005dcbc7ceab7e:process'

export function createService(serviceAccount: ServiceAccount) {
    let token: Promise<string>

    async function getToken() {
        if (!token) {
            token = getJWTFromServiceAccount(serviceAccount, {
                aud: 'https://documentai.googleapis.com/',
            })
        }
        return token
    }

    async function analyzeExpense(url: string) {
        const [{ base64, type }, token] = await Promise.all([fetchFile(url), getToken()])
        const request = {
            rawDocument: {
                content: base64,
                mimeType: type,
            },
        }
        const res = await fetch(expenseProcessor, {
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return res.json() as Promise<ExpenseResponse>
    }

    return {
        analyzeExpense,
    }
}

function fetchFile(url: string) {
    return pRetry(async () => {
        const res = await fetch(url)
        const b = await res.blob()

        const type = b.type
        const buffer = await b.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')

        return { base64, type }
    })
}
