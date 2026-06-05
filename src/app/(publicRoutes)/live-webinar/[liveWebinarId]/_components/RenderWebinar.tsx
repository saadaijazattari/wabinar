'use client'
import { User, WebinarStatusEnum } from '@prisma/client'
import React, { useEffect } from 'react'
import WebinarUpcomingState from './UpcomingWebinar/WebinarUpcomingState'
import { usePathname, useRouter } from 'next/navigation'
import { useAttendeeStore } from '@/store/useAttendeeStore'
import { toast } from 'sonner'
import LiveStreamState from './LiveWebinar/LiveStreamState'
import { StreamCallRecording, WebinarWithPresenter } from '@/lib/type'
import Participant from './Participant/Participant'

type Props = {
  error: string | undefined
  user: User | null
  isHost: boolean
  webinar: WebinarWithPresenter
  apiKey: string
  token?: string // ✅ token optional kiya (agr required hai toh type mein add karo)
  callId: string
  recording: StreamCallRecording | null
}

const RenderWebinar = ({
  error,
  user,
  isHost,
  webinar,
  apiKey,
  token,
  callId,
  recording, // ✅ recording ko props mein add kiya
}: Props) => {

  const router = useRouter()
  const pathname = usePathname()
  const { attendee } = useAttendeeStore()

  useEffect(() => {
    if (error) {
      toast.error(error)
      router.push(pathname)
    }
  }, [error, router, pathname]) // ✅ dependencies sahi kari

  // ✅ LIVE status
  if (webinar.webinarStatus === WebinarStatusEnum.LIVE) {
    // Host view
    if (user?.id === webinar.presenterId) {
      return (
        <LiveStreamState
          apiKey={apiKey}
          webinar={webinar}
          callId={callId}
          user={user}
        />
      )
    }
    
    // Attendee view
    if (attendee) {
      return (
        <Participant
          apiKey={apiKey}
          webinar={webinar}
          callId={callId}
        />
      )
    }
    
    // Default - upcoming state for non-attendees
    return (
      <WebinarUpcomingState
        webinar={webinar}
        currentUser={user || null}
      />
    )
  }

  // ✅ CANCELLED status
  if (webinar.webinarStatus === WebinarStatusEnum.CANCELLED) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-semibold text-primary">
            {webinar?.title}
          </h3>
          <p className="text-muted-foreground text-xs">
            This webinar has been cancelled.
          </p>
        </div>
      </div>
    )
  }

  // ✅ ENDED status
  if (webinar.webinarStatus === WebinarStatusEnum.ENDED) {
    if (recording?.url) {
      return (
        <video
          className="w-full h-full rounded-lg"
          controls
          src={recording.url}
        />
      )
    } else {
      return (
        <div className="flex justify-center items-center h-full w-full">
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-semibold text-primary">
              {webinar?.title}
            </h3>
            <p className="text-muted-foreground text-xl">
              This webinar has ended. No recording is available.
            </p>
          </div>
        </div>
      )
    }
  }

  // ✅ Default/Unknown status
  return (
    <WebinarUpcomingState
      webinar={webinar}
      currentUser={user || null}
    />
  )
}

export default RenderWebinar