import crypto from 'node:crypto'

const UA =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36'

function encryptVisitorId(id: string) {
  const pem =
    '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCAdf/EyIbLBxjGqmh7qLU6/CPCzru+75+82OSPZ+nf4BFvg88drpZ6KigNW0J8TNgxe6Yms1irCZNVDyu+RXsl4y/7c2KOHc4OGTzHB5fUMiMasFUvcEs2P70e6yA/sKHZfBLG1XPhlb84Ibs3nhD3W5e2SuC+4EuVkaqzN08LQIDAQAB\n-----END PUBLIC KEY-----'

  return crypto
    .publicEncrypt({ key: pem, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(id))
    .toString('base64')
}

function createSession() {
  const id = crypto.randomBytes(16).toString('hex')
  return {
    visitorId: id,
    vtoken: encryptVisitorId(id),
    conversationId: crypto.randomInt(10000000, 99999999),
    messages: [] as any[],
  }
}

async function toDataUrl(url: string) {
  const res = await fetch(url, {
    headers: {
      'user-agent': UA,
      accept: 'image/jpeg,image/png,*/*;q=0.8',
      referer: 'https://www.google.com/',
    },
  })

  const mime = (res.headers.get('content-type') || '').split(';')[0].toLowerCase()
  if (!/^image\/(jpeg|png)$/.test(mime)) throw new Error(`Format gambar tidak didukung: ${mime}`)

  return `data:${mime};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`
}

async function ask() {
  const prompt = 'Siapa nama mobil tersebut'
  const imageUrl =
    'https://akcdn.detik.net.id/community/media/visual/2021/07/08/lamborghini-aventador-lp-780-4-ultimae-3.jpeg?w=600&q=90'
  const session = createSession()

  const res = await fetch('https://aga-api.aichatting.net/aigc/chat/v2/professional/stream', {
    method: 'POST',
    headers: {
      'sec-ch-ua-platform': '"Android"',
      lang: 'en',
      'sec-ch-ua': '"Google Chrome";v="147","Not.A/Brand";v="8","Chromium";v="147"',
      'sec-ch-ua-mobile': '?1',
      vtoken: session.vtoken,
      source: 'web',
      'user-agent': UA,
      accept: 'text/event-stream,application/json,text/event-stream',
      'content-type': 'application/json',
      origin: 'https://www.aichatting.net',
      referer: 'https://www.aichatting.net/',
      'sec-fetch-site': 'same-site',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      priority: 'u=1, i',
    },
    body: JSON.stringify({
      spaceHandle: true,
      roleId: 0,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: await toDataUrl(imageUrl) } },
          ],
        },
      ],
      conversationId: session.conversationId,
      model: 'gpt-4o-mini',
    }),
  })

  if (!res.ok)
    return {
      status: false,
      code: res.status,
      question: prompt,
      answer: '',
      error: await res.text().catch(() => ''),
    }
  if (!res.body)
    return {
      status: false,
      code: res.status,
      question: prompt,
      answer: '',
      error: 'Response body kosong',
    }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let answer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split(/\r?\n/)
    buf = lines.pop() || ''
    for (const line of lines) {
      const data = line.trim().slice(5)
      if (data && !data.includes('--@DONE@--')) answer += data
    }
  }

  return {
    status: Boolean(answer),
    code: res.status,
    question: prompt,
    answer: answer
      .replace(/-=-\s*--/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
    conversationId: session.conversationId,
  }
}

ask()
  .then((r) => console.log(JSON.stringify(r, null, 2)))
  .catch((e) => {
    console.log(
      JSON.stringify(
        {
          status: false,
          code: 500,
          question: 'Siapa nama mobil tersebut',
          answer: '',
          error: e.message,
        },
        null,
        2,
      ),
    )
    process.exit(1)
  })
