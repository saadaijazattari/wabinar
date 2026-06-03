'use server'

import { getStreamClient } from '@/lib/stream/getStreamClient'
import { Attendee } from '@prisma/client'
import { UserRequest } from '@stream-io/video-react-sdk'

export const getStreamIoToken = async (attendee: Attendee | null) => {
  try {
    const userId = attendee?.id ? attendee.id.toString() : 'guest'

    const newUser: UserRequest = {
      id: userId,
      name: attendee?.name || 'Guest',
      // 🚀 FIXED: Dicebear avatar ke syntax error ko sahi template literal ($ aur api URL) mein badla
      image: `https://dicebear.com/api/initials/${encodeURIComponent(attendee?.name || 'Guest')}.svg`,
    }

    // 🚀 FIXED: getStreamClient ab ek function hai, isliye isko () ke sath call kiya
    const client = getStreamClient()

    // Ab client variable par users sync karein
    await client.upsertUsers([newUser])
    
    const validity = 60 * 60 
    
    // Ab client variable par hi token generate karein
    const token = client.generateUserToken({
      user_id: userId,
      validity_in_seconds: validity,
    })

    return token
  } catch (error) {
    // Isse aapko real error terminal par saaf dikh jayega
    console.error('Asli Stream Error Jo Backend Par Aaya:', error)
    throw new Error('Failed to generate Stream Io token')
  }
}
