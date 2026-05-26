'use client'
import { User, Webinar, WebinarStatusEnum } from '@prisma/client'
import React, { useEffect } from 'react'
import WebinarUpcomingState from './UpcomingWebinar/WebinarUpcomingState'
import { usePathname, useRouter } from 'next/navigation'
import { useAttendeeStore } from '@/store/useAttendeeStore'
import { toast } from 'sonner'

type Props = {
  error: string | undefined
  user: User | null
  webinar: Webinar
  apiKey: string
  token: string
  callId: string
}

const RenderWebinar = ({
  error,
  user,
  webinar,
  apiKey,
  token,
  callId,
}: Props) => {

  const router = useRouter()
const pathname = usePathname()

const { attendee } = useAttendeeStore()

useEffect(() => {
  if (error) {
    toast.error(error)
    router.push(pathname)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [error])


  return (
    <React.Fragment>
      {/* TODO: build Waiting room and Live */}
      {webinar.webinarStatus === WebinarStatusEnum.SCHEDULED ? (
        <WebinarUpcomingState
          webinar={webinar}
          currentUser={user || null}
        />
      ) : webinar.webinarStatus === WebinarStatusEnum.WAITING_ROOM ? (
  <WebinarUpcomingState
  webinar={webinar}
  currentUser={user || null}
/>

) : webinar.webinarStatus === WebinarStatusEnum.LIVE ? (
  //  Add live stream component and webinar stuff
  <React.Fragment>
  {user?.id === webinar.presenterId ? (
    // <LiveStreamState
    //   apiKey={apiKey}
    //   token={token}
    //   callId={callId}
    // />
    'live stream for presenter'
  ) : // Only show the participant view if they've registered
  attendee ? (
    // <Participant
    //   apiKey={apiKey}
    //   token={token}
    //   callId={callId}
    // />
    'live stream for participant'
  ) : (
    <WebinarUpcomingState
      webinar={webinar}
      currentUser={user || null}
    />
  )}
</React.Fragment>

) : (
  ''
)}


    </React.Fragment>
  )
}

export default RenderWebinar
