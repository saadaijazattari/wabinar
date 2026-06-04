import {
  StreamVideo,
  StreamVideoClient,
} from '@stream-io/video-react-sdk'
import { WebinarWithPresenter } from '@/lib/type'
import { User } from '@prisma/client'
import React, { useMemo } from 'react'
import CustomLivestreamPlayer from './CustomLivestreamPlayer'

type Props = {
  apiKey: string
  token: string
  callId: string
  webinar: WebinarWithPresenter
  user: User
}

const LiveStreamState = ({ apiKey, token, callId, webinar, user }: Props) => {
    const client = useMemo(() => new StreamVideoClient({ apiKey, user, token }), [apiKey, user, token])

  return (
    <StreamVideo client={client}>
  <CustomLivestreamPlayer
    callId={callId}
    callType="livestream"
    webinar={webinar}
    username={user.name}
    token={token}
  />
</StreamVideo>

  )
}

export default LiveStreamState
