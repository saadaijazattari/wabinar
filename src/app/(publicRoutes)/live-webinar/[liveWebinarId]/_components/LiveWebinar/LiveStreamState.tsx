import {
  StreamVideo,
  StreamVideoClient,
  User as StreamUser
} from '@stream-io/video-react-sdk'
import { WebinarWithPresenter, StreamCallRecording } from '@/lib/type'
import { User } from '@prisma/client'
import React, { useEffect, useMemo, useState } from 'react'
import CustomLivestreamPlayer from './CustomLivestreamPlayer'
import { getTokenForHost } from '@/actions/streamio'

type Props = {
  apiKey: string
  callId: string
  webinar: WebinarWithPresenter
  user: User
  recording: StreamCallRecording | null
}

const LiveStreamState = ({ apiKey, callId, webinar, user }: Props) => {
  const [hostToken, setHostToken] = useState<string | null>(null);
const [client, setClient] = useState<StreamVideoClient | null>(null);


    useEffect(() => {
  const init = async () => {
    try {
      // 🚀 FIXED: User ID consistency. Page.tsx force-karta hai ID "saad50" ko.
      const token = await getTokenForHost(
  user.id,
  user.name || webinar.presenter.name,
  user.image || webinar.presenter.profileImage
)

const hostUser: StreamUser = {
  id: user.id,
  name: user.name || webinar.presenter.name,
  image: user.image || webinar.presenter.profileImage,
}

const streamClient = new StreamVideoClient({
  apiKey,
  user: hostUser,
  token,
})

setHostToken(token)
setClient(streamClient)




    } catch (error) {
      console.error('Error initializing stream client:', error)
    }
  }
  init()
}, [apiKey, webinar])

if(!client || !hostToken) return null


  return (
    <StreamVideo client={client}>
  <CustomLivestreamPlayer
    callId={callId}
    callType="livestream"
    webinar={webinar}
    username={user.name}
    userId={user.id}
    token={hostToken}
  />
</StreamVideo>

  )
}

export default LiveStreamState
