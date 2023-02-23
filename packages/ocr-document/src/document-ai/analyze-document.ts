import ok from 'tiny-invariant'
import { ServiceAccount, getJWTFromServiceAccount } from 'cf-gcp-auth'

import { ExpenseResponse } from './model/document.types'
import { fetchFile } from './fetch-file'

const expenseProcessor =
    'https://eu-documentai.googleapis.com/v1/projects/516092020166/locations/eu/processors/d005dcbc7ceab7e:process'

type UrlInput = {
    url: string
}
type FileInput = {
    base64: string
    type: string
}
type AnalyzeInput = UrlInput | FileInput

function isUrlInput(input: AnalyzeInput): input is UrlInput {
    return Boolean((input as UrlInput).url)
}

export class DocumentAnalyzer {
    serviceAccount: ServiceAccount
    tokenPromise?: Promise<string>
    constructor({ GCP_SERVICE_ACCOUNT_JSON }: { GCP_SERVICE_ACCOUNT_JSON: string }) {
        ok(GCP_SERVICE_ACCOUNT_JSON, 'GCP_SERVICE_ACCOUNT_JSON env is required')
        this.serviceAccount = JSON.parse(GCP_SERVICE_ACCOUNT_JSON)
    }

    getToken() {
        if (!this.tokenPromise) {
            this.tokenPromise = getJWTFromServiceAccount(this.serviceAccount, {
                aud: 'https://documentai.googleapis.com/',
            })
        }
        return this.tokenPromise
    }
    async analyzeExpense(input: AnalyzeInput) {
        const [{ base64, type }, token] = await Promise.all([
            isUrlInput(input) ? fetchFile(input.url) : input,
            this.getToken(),
        ])
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
}
