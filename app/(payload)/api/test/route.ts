import { NextRequest } from "next/server"

export const POST = async (req: NextRequest) => {
    // Log everything about request like ip address or browser
    console.log(req.ip, req.headers.get('user-agent'))
    const body = await req.json()
    console.log(body)

    const cookies = req.headers.get('cookie')
    const host = req.headers.get('host')
    console.log(cookies, host)

    // fetch api to endpoint with data
    // fetch('https://api.example.com', { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify({ key: 'value' }), })
    return new Response('POST')
}