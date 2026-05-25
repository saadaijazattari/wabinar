"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PlusIcon } from '@/icons/Plusicon'
import { useWebinarStore } from '@/store/useWebinarStore'
import React, { useState } from 'react'
import MultiStepForm from './MultiStepForm/MultiStepForm'
import BasicInfoStep from './BasicInfoStep'
import CTAStep from './CTAStep'
import AdditionalInfoStep from './AdditionalInfoStep'
import Stripe from 'stripe' // 👈 Stripe import kiya

// 🛠️ FIXED: Props ke andar stripeProducts ki type define ki
type Props = {
  stripeProducts: Stripe.Product[] | []
}

const CreateWebinarButton = ({ stripeProducts }: Props) => {
  const { isModalOpen, setModalOpen, isComplete, setComplete } = useWebinarStore()
  const [webinarLink, setWebinarLink] = useState('')

  const steps = [
    {
      id: 'basicInfo',
      title: 'Basic Information',
      description: 'Please fill out the standard info needed for your webinar',
      component: <BasicInfoStep />,
    },
    {
      id: 'cta',
      title: 'CTA',
      description: 'Please provide the end-point for your customers through your webinar',
      component: (
        <CTAStep
          stripeProducts={stripeProducts} // 👈 Ab ye data sahi se transfer hoga
        />
      ),
    },
    {
      id: 'additionalInfo',
      title: 'Additional information',
      description: 'Please fill out information about additional options if necessary',
      component: <AdditionalInfoStep />,
    },
  ]

  const handleComplete = (webinarId: string) => {
    setComplete(true)
    setWebinarLink(`${process.env.NEXT_PUBLIC_BASE_URL}/live-webinar/${webinarId}`)
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-full flex gap-1.5 items-center hover:cursor-pointer px-3 py-1.5 border border-[#27272a] bg-[#18181b] text-xs font-normal text-[#a1a1aa] hover:bg-[#27272a] transition-all w-max h-max select-none"
          onClick={() => setModalOpen(true)}
        >
          <PlusIcon className="w-3.5 h-3.5" />
          <span>Create Webinar</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] p-0 bg-transparent border-none">
        {isComplete ? (
          <div className="bg-muted text-primary rounded-lg overflow-hidden">
            <DialogTitle className="sr-only">Webinar Created</DialogTitle>
          </div>
        ) : (
          <>
            <DialogTitle className="sr-only">Create Webinar</DialogTitle>
            <MultiStepForm steps={steps} onComplete={handleComplete} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreateWebinarButton
