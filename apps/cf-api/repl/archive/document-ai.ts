/// <reference lib="dom" />
import { join } from 'path'
import fs from 'fs/promises'

import { getJWTFromServiceAccount, ServiceAccount } from 'cf-gcp-auth'

const filePath = join(__dirname, './data/IMG_4723.jpg')

async function main() {
    await callWithHTTP()
}

async function callWithHTTP() {
    const serviceAccount = getServiceAccount()
    const token = await getJWTFromServiceAccount(serviceAccount, {
        aud: 'https://documentai.googleapis.com/',
    })

    const endpoint =
        'https://eu-documentai.googleapis.com/v1/projects/516092020166/locations/eu/processors/d005dcbc7ceab7e:process'

    // Read the file into memory.

    const imageFile = await fs.readFile(filePath)

    // Convert the image data to a Buffer and base64 encode it.
    const encodedImage = Buffer.from(imageFile).toString('base64')
    const request = {
        rawDocument: {
            content: encodedImage,
            mimeType: 'image/jpeg',
        },
    }
    const res = await fetch(endpoint, {
        method: 'post',
        body: JSON.stringify(request),
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    try {
        const json = await res.json()
        console.log('document-ai', json)
        await fs.writeFile(
            join(__dirname, './data/document-ai.json'),
            JSON.stringify(json, null, 4)
        )
    } catch (e) {
        console.error(e)
    }
}

function getServiceAccount() {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const GCP_SERVICE_ACCOUNT_JSON = process.env.GCP_SERVICE_ACCOUNT_JSON
    if (GCP_SERVICE_ACCOUNT_JSON) {
        return JSON.parse(GCP_SERVICE_ACCOUNT_JSON) as ServiceAccount
    }
    throw new Error('GCP_SERVICE_ACCOUNT_JSON not defined')
}

main()
