import assert from 'assert'

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

export async function analyzeExpense(input: AnalyzeInput) {
    const [{ base64, type }, token] = await Promise.all([
        isUrlInput(input) ? fetchFile(input.url) : input,
        getToken(),
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

let token: Promise<string>

async function getToken() {
    if (!token) {
        token = getJWTFromServiceAccount(getServiceAccount(), {
            aud: 'https://documentai.googleapis.com/',
        })
    }
    return token
}

function getServiceAccount() {
    const env = process.env.GCP_SERVICE_ACCOUNT_JSON
    assert(env, 'GCP_SERVICE_ACCOUNT_JSON not available')
    const sa = JSON.parse(env)
    return sa
}
