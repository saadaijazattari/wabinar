'use client'

import { CheckCircle } from '@/icons/CheckCircle'
import { onBoardingSteps } from '@/lib/data'
import Link from 'next/link'
import React from 'react'

const OnBoarding = () => {
  return (
    // yahan space-y-3 ya gap-3 use karein taaki vertical spacing thodi badhe
    <div className="flex flex-col gap-3 items-start justify-start w-full">
      {onBoardingSteps.map((step, index) => (
        <Link
          key={index}
          href={step.link}
          // whitespace-nowrap text ko wrap hone se rokega aur items-center vertical mid align karega
          className="flex items-center gap-3 whitespace-nowrap group"
        >
          {/* Icon wrapper me width aur height restrict karein taaki ye chota aur stable rahe */}
          <div className="w-5 h-5 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
            <CheckCircle />
          </div>
          <p className="text-sm md:text-base text-foreground font-medium">
            {step.title}
          </p>
        </Link>
      ))}
    </div>
  )
}

export default OnBoarding
