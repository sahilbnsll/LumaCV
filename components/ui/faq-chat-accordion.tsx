"use client";

import * as React from "react";
import { motion } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon?: string;
  iconPosition?: "left" | "right";
}

export interface FaqAccordionProps {
  data: FAQItem[];
  className?: string;
  timestamp?: string;
  questionClassName?: string;
  answerClassName?: string;
}

export function FaqAccordion({
  data,
  className,
  timestamp,
  questionClassName,
  answerClassName,
}: FaqAccordionProps) {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  return (
    <div className={cn("p-4", className)}>
      {timestamp && (
        <div className="mb-4 text-xs sm:text-sm text-muted-foreground">{timestamp}</div>
      )}

      <Accordion.Root
        type="single"
        collapsible
        value={openItem || ""}
        onValueChange={(value) => setOpenItem(value)}
      >
        {data.map((item) => (
          <Accordion.Item 
            value={item.id.toString()} 
            key={item.id} 
            className="mb-2"
          >
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full items-center justify-start gap-x-4 cursor-pointer text-left focus-visible:outline-none">
                <div
                  className={cn(
                    "relative flex items-center space-x-2 rounded-xl p-2.5 transition-colors",
                    openItem === item.id.toString() 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted hover:bg-primary/10",
                    questionClassName
                  )}
                >
                  {item.icon && (
                    <span className="shrink-0 text-muted-foreground select-none">
                      {item.icon}
                    </span>
                  )}
                  <span className="font-medium text-xs sm:text-sm">{item.question}</span>
                </div>

                <span 
                  className={cn(
                    "text-muted-foreground transition-colors shrink-0",
                    openItem === item.id.toString() && "text-primary"
                  )}
                >
                  {openItem === item.id.toString() ? (
                    <Minus className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content asChild forceMount>
              <motion.div
                initial="collapsed"
                animate={openItem === item.id.toString() ? "open" : "collapsed"}
                variants={{
                  open: { opacity: 1, height: "auto" },
                  collapsed: { opacity: 0, height: 0 },
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="ml-5 mt-1.5 md:ml-12">
                  <div
                    className={cn(
                      "relative max-w-sm md:max-w-xl rounded-2xl bg-primary px-4 py-3 text-xs sm:text-sm text-primary-foreground shadow-sm leading-relaxed",
                      answerClassName
                    )}
                  >
                    {item.answer}
                  </div>
                </div>
              </motion.div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}

const defaultData: FAQItem[] = [
  {
    answer: "The internet doesn't close. It's available 24/7.",
    icon: "❤️",
    iconPosition: "right",
    id: 1,
    question: "How late does the internet close?",
  },
  {
    answer: "No, you don't need a license to browse this website.",
    id: 2,
    question: "Do I need a license to browse this website?",
  },
  {
    answer: "Our cookies are digital, not edible. They're used for website functionality.",
    id: 3,
    question: "What flavour are the cookies?",
  },
  {
    answer: "Yes, but we do have a return policy",
    icon: "⭐",
    iconPosition: "left",
    id: 4,
    question: "Can I get lost here?",
  },
  {
    answer: "Don't worry, you can always go back or refresh the page.",
    id: 5,
    question: "What if I click the wrong button?",
  },
];

export function DefaultDemo() {
  return (
    <FaqAccordion 
      data={defaultData}
      className="max-w-[700px]"
    />
  );
}

export function CustomStyleDemo() {
  return (
    <FaqAccordion 
      data={defaultData}
      className="max-w-[700px]"
      questionClassName="bg-secondary hover:bg-secondary/80"
      answerClassName="bg-secondary text-secondary-foreground"
      timestamp="Updated daily at 12:00 PM"
    />
  );
}
