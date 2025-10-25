'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { EditableText } from '@/components/editable-text'

interface FAQ {
  question: string
  answer: string
}

interface AnimatedFAQsProps {
  homepageId: number
  faqs: FAQ[]
}

export function AnimatedFAQs({ homepageId, faqs }: AnimatedFAQsProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">Common questions about the Charlotte UDO</p>
        </motion.div>
        
        <EditableText
          collection="home_page"
          itemId={homepageId}
          field="faqs"
          mode="drawer"
          className="max-w-3xl mx-auto space-y-4"
        >
          {faqs?.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Collapsible className="w-full rounded-lg border border-border/50 bg-card shadow-sm">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-transparent">
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t px-4 py-3 text-muted-foreground text-sm">
                  {faq.answer}
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          ))}
        </EditableText>
      </div>
    </section>
  )
}

