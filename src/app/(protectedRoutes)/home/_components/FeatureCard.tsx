import Link from 'next/link'
import React from 'react'

type Props = {
  Icon: React.ReactNode
  heading: string
  link: string
}

const FeatureCard = ({ heading, Icon, link }: Props) => {
  return (
    <Link
      href={link}
      className="px-8 py-6 flex flex-col items-start justify-center gap-6 rounded-xl border border-border bg-secondary backdrop-blur-xl"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
        {Icon}
      </div>
      <p className="font-semibold text-xl text-primary">{heading}</p>
    </Link>
  )
}

export default FeatureCard
