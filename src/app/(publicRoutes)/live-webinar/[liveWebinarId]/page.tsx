import { onAuthenticateUser } from "@/actions/auth"
import { getWebinarById } from "@/actions/wabinar"
import React from 'react'
import RenderWebinar from "./_components/RenderWebinar"

type Props = {
  params: Promise<{
    liveWebinarId: string
  }>
  searchParams: Promise<{
    error: string
  }>
}

// 1. Component ka naam 'Page' (Capital P) kar diya hai
const Page = async ({ params, searchParams }: Props) => {
  const { liveWebinarId } = await params
  const { error } = await searchParams

  const webinarData = await getWebinarById(liveWebinarId)
  if (!webinarData) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center text-lg sm:text-4xl">
        Webinar not found
      </div>
    )
  }
  
  const checkUser = await onAuthenticateUser()
  
  // Todo: Create API keys
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY as string
  const token = process.env.NEXT_PUBLIC_STREAM_USER_TOKEN as string
  const callId = process.env.STREAM_CALL_ID as string



  return (
    <div className="w-full min-h-screen mx-auto">
      <RenderWebinar
        error={error}
        user={checkUser.user || null}
        webinar={webinarData}
        apiKey={apiKey}
        token={token}
        callId={callId}
      />
    </div>
  )
}

export default Page;
