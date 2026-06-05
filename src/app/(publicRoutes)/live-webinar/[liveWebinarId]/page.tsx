import { onAuthenticateUser } from "@/actions/auth"
import { getWebinarById } from "@/actions/wabinar"
import React from 'react'
import RenderWebinar from "./_components/RenderWebinar"
import { WebinarStatusEnum } from "@prisma/client"
import { WebinarWithPresenter } from "@/lib/type"

type Props = {
  params: Promise<{
    liveWebinarId: string
  }>
  searchParams: Promise<{
    error: string
  }>
}

const Page = async ({ params, searchParams }: Props) => {
  const { liveWebinarId } = await params
  const { error } = await searchParams
  const webinarData = await getWebinarById(liveWebinarId)

  let recording = null

if (webinarData?.webinarStatus === WebinarStatusEnum.ENDED) {
  // recording = await getStreamRecording(LiveWebinarId)
}



  if (!webinarData) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center text-lg sm:text-4xl">
        Webinar not found
      </div>
    )
  }
  
  const checkUser = await onAuthenticateUser()
  
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY as string

  if (!apiKey) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center text-lg gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Stream Configuration Missing</h1>
        <p className="max-w-md">Please ensure <code>NEXT_PUBLIC_STREAM_API_KEY</code>, <code>NEXT_PUBLIC_STREAM_USER_TOKEN</code>, and <code>STREAM_CALL_ID</code> are set in your <code>.env</code> file.</p>
      </div>
    )
  }

  // 🚀 FIXED: Agar database se user mila hai, toh uski ID ko .env wali ID ("saad50") se override karein
  // taake aapka static user token client-side par match ho jaye aur crash na ho.
  const streamUser = checkUser.user ? {
    ...checkUser.user,
    id: "saad50" // 👈 Yeh aapke `.env` wale token ke andar ki exact ID hai
  } : null

  const isHost = checkUser.user?.id === webinarData.presenterId

  return (
    <div className="w-full min-h-screen mx-auto">
      <RenderWebinar
        error={error}
        user={streamUser}
        isHost={isHost} // 👈 Pass host status
        webinar={webinarData as WebinarWithPresenter}
        apiKey={apiKey}
        callId={liveWebinarId}
        recording={null}
      />
    </div>
  )   
}

export default Page;
