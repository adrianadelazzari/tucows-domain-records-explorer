import { http, HttpResponse, delay } from 'msw'
import { MOCK_DOMAINS } from '../api/domains'

export const handlers = [
  http.get('/api/v1/domains', async () => {
    await delay(400 + Math.random() * 800)
    return HttpResponse.json({ data: MOCK_DOMAINS })
  }),
]
