import { FaqAccordion } from "@/components/ui/faq-chat-accordion";

const defaultData = [
  {
    answer: "The internet doesn't close. It's available 24/7.",
    icon: "❤️",
    iconPosition: "right" as const,
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
    iconPosition: "left" as const,
    id: 4,
    question: "Can I get lost here?",
  },
  {
    answer: "Don't worry, you can always go back or refresh the page.",
    id: 5,
    question: "What if I click the wrong button?",
  },
];

function DefaultDemo() {
  return (
    <FaqAccordion 
      data={defaultData}
      className="max-w-[700px]"
    />
  );
}

function CustomStyleDemo() {
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

export { DefaultDemo, CustomStyleDemo };
