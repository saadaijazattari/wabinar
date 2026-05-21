import React from 'react'

export const Spotlight = ({ className }: { className?: string }) => {
  return (
    <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM12 3v1.5m0 15V21m-9-9h1.5m15 0H21m-3.341-6.159-1.06 1.06m-9.192 9.192-1.06 1.06m0-11.314 1.06 1.06m9.192 9.192 1.06-1.06" />
    </svg>
  )
}
