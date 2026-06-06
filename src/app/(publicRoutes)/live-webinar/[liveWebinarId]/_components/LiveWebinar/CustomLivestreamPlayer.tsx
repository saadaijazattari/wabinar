'use client'
import { useStreamVideoClient, Call, StreamCall } from '@stream-io/video-react-sdk'
import { WebinarWithPresenter } from '@/lib/type'
import React, { useEffect, useState } from 'react'
import LiveWebinarView from '../Common/LiveWebinarView'

type Props = {
username: string
userId: string
callId: string
callType: string
webinar: WebinarWithPresenter
token: string
}

const CustomLivestreamPlayer = ({
username,
userId,
callId,
callType,
webinar,
token,
}: Props) => {
const client = useStreamVideoClient()
const [call, setCall] = useState<Call>()
const [showChat, setShowChat] = useState(true)

useEffect(() => {
if (!client || !callId) return
const myCall = client.call(callType, callId)
setCall(myCall)

myCall.join({ create: true }).then(
async () => {
setCall(myCall)
try {
await myCall.camera.disable();
await myCall.microphone.disable();
console.log('Host camera and microphone disabled for OBS streaming');
} catch (err) {
console.warn('Failed to disable host media:', err);
}
},
() => console.error('Failed to join the call')
)
return () => {
setCall(undefined)
}
}, [client, callId, callType])

if (!call) return null

return (
<StreamCall call={call}>
<LiveWebinarView showChat={showChat} setShowChat={setShowChat} isHost={true} username={username} userId={userId} userToken={token} webinar={webinar} call = {call} />

</StreamCall> )
}

export default CustomLivestreamPlayer