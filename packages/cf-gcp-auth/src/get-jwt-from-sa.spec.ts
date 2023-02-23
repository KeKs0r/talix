import crypto from 'crypto'

import { beforeAll, describe, expect, it } from 'vitest'

import { importPrivateKey } from './get-jwt-from-sa'

// Source: https://hookdeck.com/blog/post/how-to-call-google-cloud-apis-from-cloudflare-workers#importing-the-rsa-key
const sa_private_key = `-----BEGIN PRIVATE KEY-----
MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEApL8kivZkDZn0NPYR
pVfe8uM+IO8Fk+d3Qd4EaPcD1MHmXY8Jef1T+v33mMNUHTDiEfGi3n/9kmSN4u0p
fr/9rwIDAQABAkEAgQAe6CUYoUHc5B+OH68Xp47i1jzzXCYRzuS/BUXunQfZgncH
EO4LZz/7m6ggAx8dWPaxlsXD4QJZbatlVo4wAQIhANhPWVrWcry8oct3MDMPNLCW
+sP14q3P8fQJDT76rIgBAiEAwvm6k2qPn2S8RLyaD1gHwSgX7/oxS44n8Hztjgwn
Ba8CICp4yg6v9K9iSlJtAKXF4o6Z1nsLmIqQPe2wqU0oYyABAiBk+dqTwCtTnGMY
oiiTa77QXUhQY12mSKAMn1aUK10GRwIgU/+scWe64dWIkodZRorlYjLtJYsjNikR
5MjzJijoE1s=
-----END PRIVATE KEY-----`

/**
 * This environment thing is tricky, not sure how to
 */
describe.concurrent('JWT GCP Auth', () => {
    beforeAll(() => {
        // @ts-ignore
        globalThis.crypto = crypto
    })
    it('Can generate a token the same way as crypto module', async () => {
        const privKey = await importPrivateKey(sa_private_key)

        const crypto = (globalThis as any).crypto as Crypto
        const asJWK = await crypto.subtle.exportKey('jwk', privKey)

        // compare with doing it directly with the crypto module
        const privateKey = crypto.createPrivateKey({
            key: sa_private_key,
            format: 'pem',
        })
        const expectedJWK = privateKey.export({ format: 'jwk' })

        expect(asJWK).toMatchObject(expectedJWK)
    })
})
