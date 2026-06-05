'use server'

import { prismaClient } from "@/lib/prismaClient"
import { onAuthenticateUser } from "./auth"

export const getLeads = async () => {
  try {
    const user = await onAuthenticateUser()
    if (!user.user) {
      return { status: 401, message: 'Unauthorized' }
    }

    const webinars = await prismaClient.webinar.findMany({
      where: { presenterId: user.user.id },
      include: {
        attendances: {
          include: {
            user: true,
          },
        },
      },
    })

    // Flatten and get unique attendees
    const leadsMap = new Map<string, any>()
    
    webinars.forEach(webinar => {
      webinar.attendances.forEach(attendance => {
        const attendee = attendance.user
        if (!leadsMap.has(attendee.id)) {
          leadsMap.set(attendee.id, {
            name: attendee.name,
            email: attendee.email,
            phone: 'N/A', // Assuming phone is not available
            tags: webinar.tags, // Using webinar tags as attendee tags
          })
        }
      })
    })

    return {
      status: 200,
      data: Array.from(leadsMap.values()),
    }
  } catch (error) {
    console.error('Error fetching leads:', error)
    return {
      status: 500,
      message: 'Failed to fetch leads',
    }
  }
}
