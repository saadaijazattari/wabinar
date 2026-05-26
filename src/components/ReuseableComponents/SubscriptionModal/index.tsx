'use client'
import React, { useState, useRef } from 'react'
import { User } from '@prisma/client'

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { PlusIcon } from '@/icons/Plusicon'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { onGetStripeClientSecret, updateSubscription } from '@/actions/stripe'

type Props = {
  user: User
}

const SubscriptionModal = ({ user }: Props) => {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const closeDialogRef = useRef<HTMLButtonElement>(null)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      if (!stripe || !elements) {
        return toast.error('Stripe not initialized')
      }

      const intent = await onGetStripeClientSecret(user.email, user.id)

      if (!intent?.secret) {
        throw new Error('Failed to initialize payment')
      }

      const cardElement = elements.getElement(CardElement)

      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(intent.secret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      console.log('Payment successful', paymentIntent)

      // ✅ Update subscription status in database
      if (paymentIntent?.status === 'succeeded') {
        // Create a mock subscription object with required metadata
        const mockSubscription = {
          status: 'active',
          metadata: {
            userId: user.id,
          },
        } as any

        await updateSubscription(mockSubscription)
        
        toast.success('Subscription activated! Now you can create webinars.')
        
        // Close the modal programmatically
        if (closeDialogRef.current) {
          closeDialogRef.current.click()
        }
        
        // Refresh the page to update the Header component
        setTimeout(() => {
          router.refresh()
        }, 500)
      }
    } catch (error) {
      console.log('SUBSCRIPITON ERROR ==>', error)
      toast.error('Failed to update subscription')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="rounded-xl flex gap-2 items-center hover:cursor-pointer px-4 py-2 border border-border bg-primary/10 backdrop-blur-sm text-sm font-normal text-primary hover:bg-primary-20" >
  <PlusIcon />
  Create Webinar
</button>

      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
  <DialogHeader>
    <DialogTitle>Spotlight Subscription</DialogTitle>
  </DialogHeader>

    <CardElement
  options={{
    style: {
      base: {
        fontSize: '16px',
        color: '#B4B0AE',
        '::placeholder': {
          color: '#B4B0AE',
        },
      },
    },
  }}
  className="border-[1px] outline-none rounded-lg p-3 w-full"
/>


  <DialogFooter className="gap-4 items-center">
    <DialogClose
      ref={closeDialogRef}
      className="w-full sm:w-auto border border-border rounded-md px-3 py-2"
      disabled={loading}
    >
      Cancel
    </DialogClose>
    <Button
      type="submit"
      className="w-full sm:w-auto"
      onClick={handleConfirm}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        'Confirm'
      )}
    </Button>
  </DialogFooter>

</DialogContent>

    </Dialog>
  )
}


export default SubscriptionModal