import { subtle } from 'crypto'

import { Base64 } from 'js-base64'

// eslint-disable-next-line turbo/no-undeclared-env-vars
const extractable = process.env.NODE_ENV === 'test'

export type ServiceAccount = {
    private_key_id: string
    private_key: string
    client_email: string
}

type Scope = 'https://documentai.googleapis.com/'

type TokenOptions = {
    aud: Scope
}

export async function getJWTFromServiceAccount(sa: ServiceAccount, { aud }: TokenOptions) {
    const privateKey = await importPrivateKey(sa.private_key)

    const header = Base64.encodeURI(
        JSON.stringify({
            alg: 'RS256',
            typ: 'JWT',
            kid: sa.private_key_id,
        })
    )
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 3600

    const payload = Base64.encodeURI(
        JSON.stringify({
            iss: sa.client_email,
            sub: sa.client_email,
            aud,
            exp,
            iat,
        })
    )

    const textEncoder = new TextEncoder()
    const inputArrayBuffer = textEncoder.encode(`${header}.${payload}`)

    const outputArrayBuffer = await subtle.sign(
        { name: 'RSASSA-PKCS1-v1_5' },
        privateKey,
        inputArrayBuffer
    )

    const signature = Base64.fromUint8Array(new Uint8Array(outputArrayBuffer), true)
    const token = `${header}.${payload}.${signature}`
    return token
}

export function importPrivateKey(pem: string) {
    const pemContents = getPemContent(pem)

    const buffer = Base64.toUint8Array(pemContents)

    const algorithm = {
        name: 'RSASSA-PKCS1-v1_5',
        hash: {
            name: 'SHA-256',
        },
    }

    return subtle.importKey('pkcs8', buffer, algorithm, extractable, ['sign'])
}

function getPemContent(rawPem: string) {
    const pemHeader = '-----BEGIN PRIVATE KEY-----'
    const pemFooter = '-----END PRIVATE KEY-----'

    const pem = rawPem.replace(/\n/g, '')

    if (!pem.startsWith(pemHeader) || !pem.endsWith(pemFooter)) {
        throw new Error('Invalid service account private key')
    }

    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length)
    return pemContents
}
