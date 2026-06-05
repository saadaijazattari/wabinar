'use server'

import { prismaClient } from '@/lib/prismaClient'
import { getStreamClient } from '@/lib/stream/getStreamClient'
import { Attendee, Webinar } from '@prisma/client'
import { UserRequest } from '@stream-io/video-react-sdk'

export const getStreamIoToken = async (attendee: Attendee | null) => {
  try {
    const userId = attendee?.id ? attendee.id.toString() : 'guest'

    const newUser: UserRequest = {
      id: userId,
      name: attendee?.name || 'Guest',
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(attendee?.name || 'Guest')}`,
    }

    const client = getStreamClient()
    await client.upsertUsers([newUser])
    
    const validity = 60 * 60 
    const token = client.generateUserToken({
      user_id: userId,
      validity_in_seconds: validity,
    })

    return token
  } catch (error) {
    console.error('Stream Error:', error)
    throw new Error('Failed to generate Stream.io token')
  }
}

export const getTokenForHost = async (
  userId: string,
  username: string,
  profilePic: string
) => {
  try {
    const newUser: UserRequest = {
      id: userId,
      role: 'user',
      name: username || 'Guest',
      image: profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username || 'Guest')}`,
    }
    
    const client = getStreamClient()
    await client.upsertUsers([newUser])
    
    const validity = 60 * 60 * 60
    const token = client.generateUserToken({
      user_id: userId,
      validity_in_seconds: validity,
    })

    return token
  } catch (error) {
    console.error('Host Token Error:', error)
    throw new Error('Failed to generate host token')
  }
}




export const createAndStartStream = async (webinar: Webinar) => {
  try {
    const checkWebinar = await prismaClient.webinar.findMany({
      where: {
        presenterId: webinar.presenterId,
        webinarStatus: 'LIVE',
      },
    })

    if (checkWebinar.length > 0) {
      throw new Error('You already have a live stream running')
    }

    // 🚀 FIXED: getStreamClient ab ek function hai, isliye isko () ke sath call kiya
    const client = getStreamClient()
    const call = client.video.call('livestream', webinar.id) // Note: Stream SDK mein call type aksar 'default' ya 'livestream' hota hai, aap apne setup ke hisab se 'video' ya 'default' rakh sakte hain.

    await call.getOrCreate({
  data: {
    // starts_at: new Date(webinar.startTime),
    created_by_id: webinar.presenterId,
    members: [
      {
        user_id: webinar.presenterId, // 🚀 FIXED: User ID dena zaroori hai
        role: 'host',
      },
    ],
  },
})


call.goLive({

})

    console.log('stream created and started successfully');
    
  } catch (error) {
    console.error('Error creating and starting stream:', error)
    throw new Error('Failed to create and start stream')
  }
}
