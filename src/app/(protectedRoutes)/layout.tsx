import { onAuthenticateUser } from '@/actions/auth'
import Header from '@/components/ReuseableComponents/LayoutComponents/Header'
import Sidebar from '@/components/ReuseableComponents/LayoutComponents/Sidebar'
import { redirect } from 'next/navigation'
import React from 'react'

type Props={
    children: React.ReactNode
}

const Layout = async ({children} : Props) => {

    const userExists = await onAuthenticateUser()
    if(!userExists.user){
        redirect('/sig-in')
    }



  return (
    <div className='w-full min-h-screen flex'>
        <Sidebar/>
        <div className='flex flex-col w-full h-screen overflow-auto px-4 scrollbar-hide container mx-auto'>
        <Header user={userExists.user}/>
        {children}
        </div>
    </div>
  )
}

export default Layout