import 'server-only'
/**
 * This is what Payload does when you set secret in the config so we need to do the same for it to work.
 * This function is Edge compatible.
 */
export async function getPayloadSecret(): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(process.env.PAYLOAD_SECRET!)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return hashHex.slice(0, 32)
}

export async function generateRandomBytesHex(size: number): Promise<string> {
  const randomBuffer = crypto.getRandomValues(new Uint8Array(size))
  const hexString = Array.from(randomBuffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return hexString
}