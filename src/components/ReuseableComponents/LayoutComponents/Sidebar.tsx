'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Spotlight } from '@/icons/spotlighticon'
import { sidebarData } from '@/lib/data'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

type Props = []

const Sidebar = (props: Props) => {
    const pathname = usePathname()
  return (
    <div className="w-18 sm:w-28 h-screen sticky top-0 py-10 px-2 sm:px-6 border bg-background border-border flex flex-col items-center justify-start gap-10">
        <div>
            <Spotlight/>
        </div>
        <div className='h-full w-full justify-between items-center flex flex-col'>
            <div className='w-full h-fit flex flex-col gap-4 items-center justify-center'>

    {sidebarData.map((item)=>(
        <TooltipProvider key={item.id}>
            <Tooltip>
                <TooltipTrigger asChild>
        <Link href={item.link} className={`flex items-center gap-2 cursor-pointer rounded-lg p2 ${pathname.includes(item.link) ? "iconBackground" : ""}`}>
        <item.icon className={`w-4 h-4 ${
            pathname.includes(item.link) ? "" : "opacity-80"
        }`}/>
        </Link>
                </TooltipTrigger>
                <TooltipContent side='right'>
                    <span className='text-sm'>{item.title}</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ))}
    </div>
        </div>

    </div>
  )
}

export default Sidebar