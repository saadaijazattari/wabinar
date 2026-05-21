"use client"
import { Button } from '@/components/ui/button'
import { User } from '@prisma/client'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import React from 'react'
import PurpleIcon from './PurpleIcon'
import { LightningIcon } from '@/icons/Lightningicon'

type Props = { user: User }

//TODO: Stripe Subscription, Assistant,
const Header = ({ user }: Props) => {
    const pathname = usePathname()
    const router = useRouter()

    return (
        <div className="w-full px-4 pt-10 sticky top-0 z-10 flex justify-between items-center flex-wrap gap-4 bg-background">
            {pathname.includes('pipeline') ? (
                <Button
                    className="bg-primary/10 border border-border rounded-xl"
                    variant={'outline'}
                    onClick={() => router.push('/webinar')}
                >
                    <ArrowLeft /> Back to Webinars
                </Button>

            ) : (
                <div className="px-4 py-2 flex justify-center text-bold items-center rounded-xl bg-background border border-border text-primary capitalize">
                    {pathname.split('/')[1]}
                </div>

            )}

            <div>
                <PurpleIcon>
                    <LightningIcon/>
                </PurpleIcon>
            </div>
        </div>
    )
}

export default Header
