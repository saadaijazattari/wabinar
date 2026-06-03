"use server"

import { prismaClient } from "@/lib/prismaClient"
import { currentUser } from "@clerk/nextjs/server"

export async function onAuthenticateUser(){
    try {
        const user = await currentUser()
        if(!user){
            return {
                status: 403,
            }
        }

        // Check if user exists by clerkId
        let userExists = await prismaClient.user.findUnique({
            where: {
                clerkId: user.id
            },
        })

        if(userExists){
            return{
                status: 200,
                user: userExists
            }
        }

        // Check if user exists by email (in case of incomplete previous signup)
        const userByEmail = await prismaClient.user.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress
            },
        })

        let newUser
        if(userByEmail){
            // Update existing user with clerkId
            newUser = await prismaClient.user.update({
                where: { email: user.emailAddresses[0].emailAddress },
                data: {
                    clerkId: user.id,
                    name: user.firstName + ' ' + user.lastName,
                    profileImage: user.imageUrl,
                },
            })
        } else {
            // Create new user
            newUser = await prismaClient.user.create({
                data: {
                    clerkId: user.id,
                    email: user.emailAddresses[0].emailAddress,
                    name: user.firstName + ' ' + user.lastName,
                    profileImage: user.imageUrl,
                },
            })
        }
if (!newUser) {
  return {
    status: 500,
    message: 'Failed to create user',
  }
}

return{
    status: 200,
    user: newUser
}



    } catch (error) {
        console.log("error", error);
        return {
            status: 500,
            message: 'internal server error'
        }
    }
}