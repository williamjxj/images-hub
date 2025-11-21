"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * FAQ section component matching portrait.so design
 * Compact, clean layout with improved typography and colors
 */
export function PortraitFAQ() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const faqItems = [
    {
      question: "What is Image Hub?",
      answer:
        "Image Hub is a new kind of personal gallery—fully yours, designed for visual self-expression. Think of it as your own corner of the internet that no platform can take away, where you can showcase your images, videos, and creative work.",
    },
    {
      question: "Is this a social network?",
      answer:
        "No, Image Hub is not a social network. It's a personal gallery space where you can organize and share your visual creations. It's your own space on the internet.",
    },
    {
      question: "Do I need to know technical skills to use Image Hub?",
      answer:
        "No technical skills required! Image Hub is designed to be easy to use for anyone. Simply upload your images, organize them, and share your gallery.",
    },
    {
      question: "How do I get started?",
      answer:
        "Getting started is easy. Click the 'Create your Gallery' button, upload your first image, and start building your visual portfolio. You can add images, videos, links, and text to create a unique gallery.",
    },
    {
      question: "How much does it cost?",
      answer:
        "Image Hub offers a free tier for basic galleries. Premium features and customization options are available with a Plus subscription for $10/month.",
    },
    {
      question: "Where is my gallery stored?",
      answer:
        "Your gallery content is stored securely using industry-standard practices. Your data is yours and remains accessible even if platforms change.",
    },
    {
      question: "Can I use my own domain?",
      answer:
        "Yes! With Plus, you can link your own custom domain to point directly to your gallery—like you.com instead of imagehub.com/you.",
    },
    {
      question: "Is my gallery really mine?",
      answer:
        "Absolutely. Your gallery is yours, secured and verifiable. Even if platforms vanish, your presence remains intact and publicly accessible.",
    },
    {
      question: "Can I use Image Hub for my business or as a creator?",
      answer:
        "Yes! Image Hub is perfect for businesses, creators, photographers, and anyone who wants to showcase their visual work in a professional, organized way.",
    },
    {
      question: "Is this open source?",
      answer:
        "Yes, Image Hub is built on open source principles and open standards. No vendor lock-in, so your content remains usable across platforms and time.",
    },
  ];

  return (
    <motion.section
      id="faq"
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-20"
      aria-labelledby="faq-heading"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto max-w-4xl">
        <motion.h2
          id="faq-heading"
          className="mb-12 text-center text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Frequently asked questions
        </motion.h2>
        {isMounted ? (
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: index * 0.03, duration: 0.4 }}
              >
                <AccordionItem 
                  value={`item-${index}`} 
                  className="border-b border-border/40 last:border-b-0"
                >
                  <AccordionTrigger className="text-left py-5 hover:no-underline group">
                    <span className="font-serif text-base sm:text-lg font-semibold text-foreground group-hover:text-primary/90 transition-colors">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm sm:text-base text-muted-foreground pb-5 leading-relaxed font-sans">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        ) : (
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-border/40 pb-5 last:border-b-0">
                <h3 className="text-left font-serif font-semibold text-base sm:text-lg mb-2 text-foreground">
                  {item.question}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base font-sans leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}

