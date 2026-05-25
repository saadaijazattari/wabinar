import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useWebinarStore } from '@/store/useWebinarStore'
import { CtaTypeEnum } from '@prisma/client'
import { Search, X } from 'lucide-react'
import React, { useState } from 'react'
import Stripe from 'stripe'

type Props = {
  stripeProducts: Stripe.Product[] | []
}

const CTAStep = ({ stripeProducts }: Props) => {
  const {
    formData,
    updateCTAField,
    addTag,
    removeTag,
    getStepValidationErrors,
  } = useWebinarStore()
  const [tagInput, setTagInput] = useState('')
  const { ctaLabel, tags, priceId } = formData.cta
  const errors = getStepValidationErrors('cta')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateCTAField(name as keyof typeof formData.cta, value)
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      addTag(tagInput.trim())
      setTagInput('')
    }
  }

  const handleSelectCTAType = (value: string) => {
    updateCTAField('ctaType', value as CtaTypeEnum)
  }

  const handleProductChange = (value: string) => {
    // Agar fallback default select ho to save na karein
    if (value === 'none') return
    updateCTAField('priceId', value)
  }

  return (
    <div className="space-y-6">
      {/* CTA Label Section */}
      <div className="space-y-2">
        <Label htmlFor="ctaLabel" className={errors.ctaLabel ? 'text-red-400' : ''}>
          CTA Label <span className="text-red-400">*</span>
        </Label>
        <Input
          id="ctaLabel"
          name="ctaLabel"
          value={ctaLabel || ''}
          onChange={handleChange}
          placeholder="Let's Get Started"
          className={cn(
            '!bg-background/50 border border-input',
            errors.ctaLabel && 'border-red-400 focus-visible:ring-red-400'
          )}
        />
        {errors.ctaLabel && <p className="text-sm text-red-400">{errors.ctaLabel}</p>}
      </div>

      {/* Tags Section */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tags and press Enter"
          className="!bg-background/50 border border-input"
        />

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag: string, index: number) => (
              <div key={index} className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-md">
                {tag}
                <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Type Section */}
      <div className="space-y-2 w-full">
        <Label>CTA Type</Label>
        <Tabs defaultValue={CtaTypeEnum.BOOK_A_CALL} className="w-full">
          <TabsList className="w-full bg-transparent">
            <TabsTrigger
              value={CtaTypeEnum.BOOK_A_CALL}
              className="w-1/2 data-[state=active]:!bg-background/50"
              onClick={() => handleSelectCTAType(CtaTypeEnum.BOOK_A_CALL)}
            >
              Book a Call
            </TabsTrigger>

            <TabsTrigger
              value={CtaTypeEnum.BUY_NOW}
              className="w-1/2"
              onClick={() => handleSelectCTAType(CtaTypeEnum.BUY_NOW)}
            >
              Buy Now
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Product Attachment Section */}
      // Is pure block ko 'Product Attachment Section' ke dropdown ki jagah replace karein
<div className="space-y-2">
  <Label htmlFor="product-select">Attach a Product</Label>
  
  <div className="space-y-3">
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 z-10" />
      <Input
        placeholder="Search agents"
        className="pl-9 !bg-background/50 border border-input relative z-0"
      />
    </div>

    {/* 🚀 Shadcn component ki jagah standard native dropdown container */}
    <select
      id="product-select"
      value={priceId || ''}
      onChange={(e) => handleProductChange(e.target.value)}
      className="w-full h-10 px-3 py-2 text-sm text-white rounded-md border border-input !bg-background/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
    >
      <option value="" disabled className="bg-neutral-900 text-gray-400">
        Select a product
      </option>
      
      {stripeProducts && stripeProducts.length > 0 ? (
        stripeProducts.map((product) => (
          <option
            key={product.id}
            value={typeof product.default_price === 'string' ? product.default_price : product.id}
            className="bg-neutral-900 text-white"
          >
            {product.name}
          </option>
        ))
      ) : (
        <option value="" disabled className="bg-neutral-900 text-gray-500">
          Create product in stripe
        </option>
      )}
    </select>
  </div>
</div>

    </div>
  )
}

export default CTAStep
