'use client'
import { WebinarWithPresenter } from '@/lib/type'
import { Loader2, MessageSquare, Users, Video } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {StreamChat} from  'stream-chat'
import {
  ParticipantView,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk'
import { Button } from '@/components/ui/button'
import { CtaTypeEnum } from '@prisma/client'
import 'stream-chat-react/dist/css/v2/index.css'
import { Chat, Channel, MessageList, MessageInput } from 'stream-chat-react'
import CTADialogBox from './CTADialogBox'
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { changeWebinarStatus } from '@/actions/wabinar'



type Props = {
  showChat: boolean
  setShowChat: (show: boolean) => void
  webinar: WebinarWithPresenter
  isHost?: boolean
  username: string
  userId: string
  userToken: string
}

const LiveWebinarView = ({
  showChat,
  setShowChat,
  webinar,
  isHost,
  username,
  userId,
  userToken,
}: Props) => {
  const router = useRouter()
  const {useParticipantCount, useParticipants} = useCallStateHooks()
  const call = useCall()
  const [showRTMP, setShowRTMP] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const participants = useParticipants()
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)
  const [channel, setChannel] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(true)
  const [loading, setLoading] = useState(false) 
// Find the host participant: prioritize those with video, or fall back to the first participant
const hostParticipant = participants.find(p => p.videoStream) || (participants.length > 0 ? participants[0] : null)


const viewerCount = useParticipantCount();

const handleEndStream = async () => {
  setLoading(true);
  try {
    const res = await changeWebinarStatus(webinar.id, "ENDED");
    if (!res.success) {
      throw new Error(res.message);
    }
    router.refresh();
    toast.success("Webinar ended successfully");
  } catch (error) {
    console.error("Error ending stream", error);
    toast.error("Error ending stream");
  } finally {
    setLoading(false);
  }
};



const handleCTAButtonClick = async () => {
  if (!channel) return
  console.log('CTA button clicked', channel)
  await channel.sendEvent({
    type: 'open_cta_dialog',
  })
}

const handleRefreshCall = async () => {
  if (!call) {
    toast.error('Call not initialized')
    return
  }
  setIsRefreshing(true)
  try {
    const response = await call.get()
    console.log('--- DEBUG: Stream Call State ---')
    console.log('Call ID:', call.id)
    console.log('Ingress Data:', call.state.ingress)
    console.log('Full State Response:', response)
    
    if (!call.state.ingress) {
      toast.info('Ingress is still not available. Ensure RTMP is enabled in Stream Dashboard.')
    } else {
      toast.success('OBS details refreshed')
    }
  } catch (error) {
    console.error('Error refreshing call', error)
    toast.error('Failed to refresh OBS details')
  } finally {
    setIsRefreshing(false)
  }
}

const copyToClipboard = (text: string, label: string) => {
  if (!text || text === 'Loading...') {
    toast.error(`Please wait, ${label} is still loading`)
    return
  }
  navigator.clipboard.writeText(text)
    .then(() => toast.success(`${label} copied to clipboard`))
    .catch(() => toast.error(`Failed to copy ${label}. Please select and copy manually.`))
}

// Auto-fetch call details if ingress is missing for host
useEffect(() => {
  if (call && isHost && !call.state.ingress) {
    call.get().catch(err => console.error("Auto-fetch call info error:", err))
  }
}, [call, isHost])



useEffect(() => {
  const initChat = async () => {
    const client = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!
    )

    await client.connectUser(
      {
        id: userId,
        name: username,
      },
      userToken
    )

    const channel = client.channel('livestream', webinar.id, {
      name: webinar.title,
    })

    await channel.watch()

      setChatClient(client)
  setChannel(channel)
}

initChat()

return () => {
  if (chatClient) {
    chatClient.disconnectUser()
  }
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [userId, username, userToken, webinar.id, webinar.title])




useEffect(() => {
  if (chatClient && channel) {
    channel.on((event: any) => {
      if (event.type === 'open_cta_dialog' && !isHost) {
        setDialogOpen(true)
      }

    //   channel.on(handleEvent)
    
    // return () => {
    //   channel.off(handleEvent) // ✅ Add cleanup
    // }
    })
  }
}, [chatClient, channel, isHost])

if (!chatClient || !channel) return null


return (
    <div className="flex flex-col w-full h-screen max-h-screen overflow-hidden bg-background text-foreground">
  <div className="py-2 px-4 border-b border-border flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <div className="bg-accent-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive animate-pulse"></span>
        </span>
        LIVE
      </div>
    </div>

    <div className="flex items-center space-x-3">
  <div className="flex items-center space-x-1 bg-muted/50 px-3 py-1 rounded-full">
    <Users size={16} />
    <span className="text-sm">{viewerCount}</span>
  </div>

  {isHost && (
    <button
      onClick={() => setShowRTMP(!showRTMP)}
      className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
        showRTMP ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
      }`}
      title="OBS Settings"
    >
      <Video size={16} />
      <span>OBS</span>
    </button>
  )}

    <button
    onClick={() => setShowChat(!showChat)}
    className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${
      showChat
        ? "bg-accent-primary text-primary-foreground"
        : "bg-muted/50"
    }`}
  >
    <MessageSquare size={16} />
    <span>Chat</span>
  </button>

</div>


  </div>


    <div className="flex flex-1 p-2 gap-2 overflow-hidden relative">
      {isHost && showRTMP && (
        <div className="absolute top-4 left-4 z-50 w-80 bg-background border border-border rounded-lg shadow-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <Video size={18} className="text-primary" />
              OBS Settings
            </h4>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefreshCall}
                disabled={isRefreshing}
                className={`p-1 hover:bg-accent rounded transition-all ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
                title="Refresh Details"
              >
                <RefreshCw size={16} />
              </button>
              <button 
                onClick={() => setShowRTMP(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <EyeOff size={16} />
              </button>
            </div>
          </div>
          
            <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Stream URL</label>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={call?.state.ingress?.rtmp.address || (call ? 'Ingress not ready' : 'Call not found')} 
                  className="flex-1 bg-muted text-xs p-2 rounded border border-border"
                />
                <button 
                  disabled={!call?.state.ingress?.rtmp.address}
                  onClick={() => copyToClipboard(call?.state.ingress?.rtmp.address || '', 'Stream URL')}
                  className="p-2 hover:bg-accent rounded transition-colors disabled:opacity-30"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Stream Key</label>
              <div className="flex gap-2">
                <input 
                  type={showKey ? 'text' : 'password'}
                  readOnly 
                  value={call?.state.ingress?.rtmp.streamKey || (call ? 'Key not ready' : 'Call not found')} 
                  className="flex-1 bg-muted text-xs p-2 rounded border border-border"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 hover:bg-accent rounded transition-colors"
                  title={showKey ? 'Hide' : 'Show'}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button 
                  disabled={!call?.state.ingress?.rtmp.streamKey}
                  onClick={() => copyToClipboard(call?.state.ingress?.rtmp.streamKey || '', 'Stream Key')}
                  className="p-2 hover:bg-accent rounded transition-colors disabled:opacity-30"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            
            {!call?.state.ingress && (
              <div className="bg-destructive/10 p-2 rounded text-[10px] text-destructive border border-destructive/20">
                Warning: RTMP Ingress is not enabled for this call. Please check your Stream Dashboard or ensure you have Host permissions.
              </div>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            Copy these into OBS Studio Settings &gt; Stream.
          </p>
        </div>
      )}
  <div className="flex-1 rounded-lg overflow-hidden border border-border flex flex-col bg-card">
    <div className="flex-1 relative overflow-hidden">
      {hostParticipant ? (
        <div className={`w-full h-full`}>
          <ParticipantView
            participant={hostParticipant}
            className="w-full h-full object-cover !max-w-full"
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col space-y-4">
  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
    <Users
      size={40}
      className="text-muted-foreground"
    />
  </div>
  <p>Waiting for stream to start...</p>
</div>

      )}
      {isHost && (
  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
    Host
  </div>
)}

    </div>

    <div className="p-2 border-t border-border flex items-center justify-between py-2">
  <div className="flex items-center space-x-2">
    <div className="text-sm font-medium capitalize">
      {webinar?.title}
    </div>
  </div>
  {isHost && (
  <div className="flex items-center space-x-1">
    <Button onClick={handleEndStream} disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="animate-spin mr-2" />
      Loading...
    </>
  ) : (
    "End Stream"
  )}
</Button>

    <Button onClick={handleCTAButtonClick}>
      {webinar.ctaType === CtaTypeEnum.BOOK_A_CALL
        ? 'Book a Call'
        : 'Buy Now'}
    </Button>
  </div>
)}

</div>


  </div>
  {showChat && (
  <Chat client={chatClient}>
    <Channel channel={channel}>
      <div className="w-72 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="py-2 px-3 border-b border-border font-medium flex items-center justify-between">
          <span>Chat</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
            {viewerCount} viewers
          </span>
        </div>

        <MessageList />

        <div className="p-2 border-t border-border">
          <MessageInput />
        </div>
      </div>
    </Channel>
  </Chat>
)}

</div>

{dialogOpen && (
  <CTADialogBox
    open={dialogOpen}
    onOpenChange={setDialogOpen}
    webinar={webinar}
    userId={userId}
  />
)}



</div>

  )
}

export default LiveWebinarView



