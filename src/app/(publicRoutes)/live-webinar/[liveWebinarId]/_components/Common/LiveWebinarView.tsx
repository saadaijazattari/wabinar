'use client'
import { WebinarWithPresenter } from '@/lib/type'
import { Loader2, MessageSquare, Users, Video } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import {
  ParticipantView,
  useCallStateHooks,
  Call
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
import ObsDialogBox from './ObsDialogBox'

type Props = {
  showChat: boolean
  setShowChat: (show: boolean) => void
  webinar: WebinarWithPresenter
  isHost?: boolean
  username: string
  userId: string
  call: Call
  userToken: string
}

const LiveWebinarView = ({
  showChat,
  setShowChat,
  webinar,
  isHost,
  username,
  userId,
  call,
  userToken,
}: Props) => {
  const router = useRouter()
  const { useParticipantCount, useParticipants } = useCallStateHooks()
  const [showRTMP, setShowRTMP] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const participants = useParticipants()
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)
  const [channel, setChannel] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [obsDialogBox, setObsDialogOpen] = useState(false)
  
  // 🚀 FIXED: Ingress data state
  const [ingressData, setIngressData] = useState<{
    rtmpAddress: string
    streamKey: string
  } | null>(null)

  const hostParticipant = participants.find(p => p.userId !== userId && p.videoStream) || 
                          participants.find(p => p.videoStream) || 
                          (participants.length > 0 ? participants[0] : null)
  const viewerCount = useParticipantCount()

  // 🚀 FIXED: Ingress ko correctly access karne ka tarika
  // 🚀 FIXED: Stream key ke saare possible names check karo
// 🚀 FINAL FIX: Stream key address ke andar hai
const getIngressInfo = async () => {
  if (!call) return null
  
  try {
    const callData = await call.get()
    const ingress = callData.call?.ingress
    
    console.log('📡 Raw Ingress Data:', JSON.stringify(ingress, null, 2))
    
    if (ingress?.rtmp?.address) {
      const fullAddress = ingress.rtmp.address
      console.log('🔍 Full Address:', fullAddress)
      
      // Regex jo sirf slash (/) ke baad wali Stream Key ko nikalega
      // Aur baaki ka poora shuruati hissa Server URL rahega
      const match = fullAddress.match(/(rtmps?:\/\/[^\/]+)\/(.+)/)
      
      if (match) {
        // Stream.io ke liye full address hi standard server path hota hai (with port if present)
        const serverUrl = match[1]    // e.g., rtmps://://stream-io-video.com ya rtmps://://stream-io-video.com
        const streamKey = match[2]    // e.g., zpn8qbpsufss.livestream.xxx
        
        const rtmpData = {
          rtmpAddress: serverUrl,
          streamKey: streamKey
        }
        
        console.log('✅ OBS New Format:')
        console.log('  Server:', serverUrl)
        console.log('  Key:', streamKey)
        
        return rtmpData
      } else {
        console.error('❌ Failed to parse RTMP URL')
        return null
      }
    }
    
    console.warn('⚠️ No RTMP address found')
    return null
  } catch (error) {
    console.error('❌ Error fetching ingress:', error)
    return null
  }
}



  const getRtmpAddress = () => {
    if (!ingressData?.rtmpAddress) return 'Loading...'
    return ingressData.rtmpAddress
  }

  const getStreamKey = () => {
    if (!ingressData?.streamKey) return 'Loading...'
    return ingressData.streamKey
  }

  const handleEndStream = async () => {
    setLoading(true)
    try {
      await call?.stopLive({
        continue_recording: false,
      })
      await call?.endCall()
      const res = await changeWebinarStatus(webinar.id, "ENDED")
      if (!res.success) {
        throw new Error(res.message)
      }
      toast.success("Webinar ended successfully")
      router.push('/')
    } catch (error) {
      console.error("Error ending stream", error)
      toast.error("Error ending stream")
    } finally {
      setLoading(false)
    }
  }

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
      const data = await getIngressInfo()
      setIngressData(data)
      
      if (data?.rtmpAddress && data?.streamKey) {
        toast.success('OBS details loaded successfully! 🎉')
      } else {
        toast.error('RTMP Ingress not found. Please enable it in Stream Dashboard.')
      }
    } catch (error) {
      console.error('Error refreshing call:', error)
      toast.error('Failed to refresh OBS details')
    } finally {
      setIsRefreshing(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    if (!text || text === 'Loading...') {
      toast.error(`${label} is still loading. Click "Refresh" button.`)
      return
    }
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`✅ ${label} copied!`))
      .catch(() => toast.error(`Failed to copy ${label}`))
  }

  // 🚀 FIXED: Initial load
  useEffect(() => {
    if (call && isHost) {
      // Wait a bit for call to be fully initialized
      setTimeout(() => {
        getIngressInfo().then(data => {
          setIngressData(data)
          if (!data) {
            toast.info('Click "Refresh" to load OBS credentials')
          }
        })
      }, 1000)
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

      const newChannel = client.channel('livestream', webinar.id, {
        name: webinar.title,
      })

      await newChannel.watch()

      setChatClient(client)
      setChannel(newChannel)
    }

    initChat()

    return () => {
      if (chatClient) {
        chatClient.disconnectUser()
      }
    }
  }, [userId, username, userToken, webinar.id, webinar.title])

  useEffect(() => {
    if (obsDialogBox && call && isHost) {
      handleRefreshCall()
    }
  }, [obsDialogBox])

  useEffect(() => {
    if (!chatClient || !channel) return

    const handleEvent = (event: any) => {
      if (event.type === 'open_cta_dialog' && !isHost) {
        setDialogOpen(true)
      }
    }

    channel.on(handleEvent)
    return () => {
      channel.off(handleEvent)
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
              className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 transition-all ${
                showRTMP ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted'
              }`}
              title="OBS Settings"
            >
              <Video size={16} />
              <span>OBS</span>
            </button>
          )}

          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 transition-all ${
              showChat ? "bg-accent-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
            }`}
          >
            <MessageSquare size={16} />
            <span>Chat</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 p-2 gap-2 overflow-hidden relative">
        {isHost && showRTMP && (
          <div className="absolute top-4 left-4 z-50 w-96 bg-background border-2 border-primary/20 rounded-lg shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <Video size={20} className="text-primary" />
                OBS Stream Settings
              </h4>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleRefreshCall}
                  disabled={isRefreshing}
                  className={`p-2 hover:bg-accent rounded-full transition-all ${
                    isRefreshing ? 'animate-spin opacity-50' : 'hover:scale-110'
                  }`}
                  title="Refresh Credentials"
                >
                  <RefreshCw size={18} className="text-primary" />
                </button>
                <button 
                  onClick={() => setShowRTMP(false)}
                  className="text-muted-foreground hover:text-foreground p-2 hover:bg-accent rounded-full transition-all"
                >
                  <EyeOff size={18} />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* RTMP Server URL */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  RTMP Server URL
                </label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={getRtmpAddress()} 
                    className="flex-1 bg-muted/50 text-sm p-3 rounded-lg border border-border focus:border-primary transition-colors font-mono"
                    placeholder="rtmp://..."
                  />
                  <button 
                    onClick={() => copyToClipboard(getRtmpAddress(), 'Server URL')}
                    className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all hover:scale-105"
                    title="Copy URL"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Stream Key */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Stream Key
                </label>
                <div className="flex gap-2">
                  <input 
                    type={showKey ? 'text' : 'password'}
                    readOnly 
                    value={getStreamKey()} 
                    className="flex-1 bg-muted/50 text-sm p-3 rounded-lg border border-border focus:border-primary transition-colors font-mono"
                    placeholder="••••••••"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="p-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-all"
                    title={showKey ? 'Hide Key' : 'Show Key'}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button 
                    onClick={() => copyToClipboard(getStreamKey(), 'Stream Key')}
                    className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all hover:scale-105"
                    title="Copy Key"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className={`p-3 rounded-lg border ${
                ingressData ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
              }`}>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    ingressData ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                  }`}></div>
                  <span className={ingressData ? 'text-green-600' : 'text-yellow-600'}>
                    {ingressData ? '✅ Credentials Ready' : '⏳ Click Refresh to Load'}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                📖 OBS Setup Guide
              </h5>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                <li>Open OBS Studio</li>
                <li>Go to <strong>Settings → Stream</strong></li>
                <li>Service: Select <strong>"Custom"</strong></li>
                <li>Paste <strong>Server URL</strong> above</li>
                <li>Paste <strong>Stream Key</strong> above</li>
                <li>Click <strong>OK</strong> then <strong>Start Streaming</strong></li>
              </ol>
            </div>
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
                  <Users size={40} className="text-muted-foreground" />
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
                <Button
                  onClick={() => setObsDialogOpen(true)}
                  variant="outline"
                  className="mr-2"
                >
                  Get OBS Creds
                </Button>

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
                  {webinar.ctaType === CtaTypeEnum.BOOK_A_CALL ? 'Book a Call' : 'Buy Now'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {showChat && (
          <Chat client={chatClient}>
            <Channel channel={channel}>
              <div className="w-72 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="py-2 text-primary px-3 border-b border-border font-medium flex items-center justify-between">
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
      {obsDialogBox && (
        <ObsDialogBox
          open={obsDialogBox}
          onOpenChange={setObsDialogOpen}
          rtmpURL={getRtmpAddress()}
          streamKey={getStreamKey()}
        />
      )}

    </div>
  )
}

export default LiveWebinarView