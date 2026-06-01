import { StreamClient } from '@stream-io/node-sdk'

// 🚀 FIXED: Isko function banaya taake runtime par hamesha sahi variables load hon
export const getStreamClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY
  const apiSecret = process.env.STREAM_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('Stream API keys are missing in environment variables!')
  }

  return new StreamClient(apiKey, apiSecret)
}
