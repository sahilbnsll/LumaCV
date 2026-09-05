"use client"

import { useState, type ReactNode } from "react"
import { motion, LayoutGroup, type PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"
import { Grid3X3, Layers, LayoutList, ArrowRight } from "lucide-react"

export type LayoutMode = "stack" | "grid" | "list"

export interface CardData {
  id: string
  title: string
  description: string
  icon?: ReactNode
  color?: string
  image?: string
  badge?: string
  tag?: string
  actionUrl?: string
  actionText?: string
}

export interface MorphingCardStackProps {
  cards?: CardData[]
  className?: string
  defaultLayout?: LayoutMode
  cardVariant?: "default" | "resume"
  onCardClick?: (card: CardData) => void
}

const layoutOptions: { mode: LayoutMode; label: string; icon: typeof Layers }[] = [
  { mode: "stack", label: "Stack", icon: Layers },
  { mode: "grid", label: "Grid", icon: Grid3X3 },
  { mode: "list", label: "List", icon: LayoutList },
]

const SWIPE_THRESHOLD = 60

export function MorphingCardStack({
  cards = [],
  className,
  defaultLayout = "stack",
  cardVariant = "default",
  onCardClick,
}: MorphingCardStackProps) {
  const [layout, setLayout] = useState<LayoutMode>(defaultLayout)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  if (!cards || cards.length === 0) {
    return null
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    const swipePower = Math.abs(offset.x) * velocity.x

    if (offset.x < -SWIPE_THRESHOLD || swipePower < -800) {
      // Swiped left - advance
      setActiveIndex((prev) => (prev + 1) % cards.length)
    } else if (offset.x > SWIPE_THRESHOLD || swipePower > 800) {
      // Swiped right - previous
      setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }
    setIsDragging(false)
  }

  // Smooth layout container dimensions
  const containerStyles = cardVariant === "resume" ? {
    stack: "relative h-[500px] w-full max-w-[310px] sm:max-w-[370px] mx-auto",
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl",
    list: "flex flex-col gap-4 max-w-3xl",
  } : {
    stack: "relative h-[310px] w-full max-w-[310px] sm:max-w-[380px] mx-auto",
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl",
    list: "flex flex-col gap-3.5 max-w-3xl",
  }

  return (
    <div className={cn("space-y-6 w-full", className)}>
      {/* Smooth Layout Toggle Bar with Sliding Background Pill */}
      <div className="flex items-center justify-center gap-1 rounded-2xl bg-muted/50 dark:bg-card/70 border border-border/60 p-1 w-fit mx-auto backdrop-blur-md shadow-2xs">
        {layoutOptions.map(({ mode, label, icon: Icon }) => {
          const isActive = layout === mode
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setLayout(mode)}
              className={cn(
                "relative rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer z-10",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={`Switch to ${mode} layout`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeLayoutPill"
                  className="absolute inset-0 rounded-xl bg-primary shadow-xs -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      {/* Cards Container with Spring Physics */}
      <LayoutGroup>
        <motion.div
          layout
          transition={{
            layout: { type: "spring", stiffness: 220, damping: 28 },
          }}
          className={cn(containerStyles[layout], "mx-auto")}
        >
          {cards.map((card, index) => {
            // Calculate relative offset in circular stack without re-creating DOM nodes
            const stackPos = (index - activeIndex + cards.length) % cards.length
            const isTopCard = layout === "stack" && stackPos === 0
            const isExpanded = expandedCard === card.id

            // Natural, subtle stack depth math (centered with natural fanning)
            const stackTransforms = layout === "stack" ? {
              0: { y: 0, scale: 1, rotate: 0, opacity: 1, zIndex: 30 },
              1: { y: 12, scale: 0.96, rotate: 2.2, opacity: 0.92, zIndex: 20 },
              2: { y: 24, scale: 0.92, rotate: -1.8, opacity: 0.76, zIndex: 10 },
            }[stackPos] || { y: 32, scale: 0.88, rotate: 0, opacity: 0, zIndex: 1 } : {
              y: 0,
              scale: isExpanded ? 1.02 : 1,
              rotate: 0,
              opacity: 1,
              zIndex: 1,
            }

            return (
              <motion.div
                key={card.id}
                layout
                initial={false}
                animate={{
                  y: stackTransforms.y,
                  scale: stackTransforms.scale,
                  rotate: stackTransforms.rotate,
                  opacity: stackTransforms.opacity,
                  zIndex: stackTransforms.zIndex,
                }}
                transition={{
                  layout: { type: "spring", stiffness: 220, damping: 28 },
                  y: { type: "spring", stiffness: 260, damping: 28 },
                  scale: { type: "spring", stiffness: 260, damping: 28 },
                  rotate: { type: "spring", stiffness: 260, damping: 28 },
                  opacity: { duration: 0.2 },
                }}
                drag={isTopCard ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.35}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                onClick={() => {
                  if (isDragging) return
                  setExpandedCard(isExpanded ? null : card.id)
                  onCardClick?.(card)
                }}
                className={cn(
                  "cursor-pointer rounded-2xl border border-border/80 bg-card p-4.5 transition-colors overflow-hidden backdrop-blur-xs",
                  "hover:border-primary/50 shadow-sm",
                  cardVariant === "resume" && layout === "stack" && "absolute inset-x-0 top-0 w-full h-[470px] flex flex-col justify-between shadow-xl shadow-black/15",
                  cardVariant === "resume" && layout === "grid" && "w-full min-h-[410px] flex flex-col justify-between",
                  cardVariant === "resume" && layout === "list" && "w-full p-4.5",
                  cardVariant !== "resume" && layout === "stack" && "absolute inset-x-0 top-0 w-full h-[280px] flex flex-col justify-between shadow-xl shadow-black/15",
                  cardVariant !== "resume" && layout === "grid" && "w-full min-h-[240px] flex flex-col justify-between",
                  cardVariant !== "resume" && layout === "list" && "w-full flex items-center justify-between gap-4 p-4",
                  layout === "stack" && isTopCard && "cursor-grab active:cursor-grabbing",
                  isExpanded && "ring-2 ring-primary",
                )}
                style={{
                  backgroundColor: card.color || undefined,
                }}
              >
                {cardVariant === "resume" && card.image ? (
                  /* ---------------------------------------------------- */
                  /* RESUME TEMPLATE CARD VARIANT                         */
                  /* ---------------------------------------------------- */
                  <div className={cn(
                    "flex flex-col h-full justify-between w-full",
                    layout === "list" && "sm:flex-row sm:items-center sm:gap-6"
                  )}>
                    {/* Typst Resume Image Preview */}
                    <div className={cn(
                      "relative overflow-hidden rounded-xl border border-border/70 bg-muted/20 shrink-0 shadow-2xs group/img",
                      layout === "list" ? "w-full sm:w-48 aspect-[4/3] sm:h-32" : "w-full aspect-[4/3]"
                    )}>
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-105"
                      />
                      {card.badge && (
                        <span className="absolute top-2.5 right-2.5 text-[9px] font-mono font-medium text-emerald-400 bg-background/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-emerald-500/20 shadow-xs">
                          {card.badge}
                        </span>
                      )}
                    </div>

                    {/* Content details */}
                    <div className={cn("flex flex-col justify-between flex-1", layout !== "list" ? "mt-3.5 space-y-2" : "space-y-1.5")}>
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display font-bold text-sm sm:text-base text-card-foreground">{card.title}</h3>
                          {card.tag && (
                            <span className="text-[10px] font-mono text-muted-foreground shrink-0">{card.tag}</span>
                          )}
                        </div>
                        <p className={cn(
                          "text-xs text-muted-foreground mt-1.5 leading-relaxed",
                          layout === "stack" && "line-clamp-2",
                          layout === "grid" && "line-clamp-2",
                          layout === "list" && "line-clamp-2",
                        )}>
                          {card.description}
                        </p>
                      </div>

                      {card.actionUrl && (
                        <div className="pt-2.5 flex items-center justify-between border-t border-border/40">
                          <a
                            href={card.actionUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            <span>{card.actionText || "Try Sample"}</span>
                            <ArrowRight className="h-3 w-3" />
                          </a>
                          <span className="text-[10px] font-mono text-muted-foreground/60">Typst AST</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ---------------------------------------------------- */
                  /* LUMACV ARCHITECTURE ENGINE CARD VARIANT             */
                  /* ---------------------------------------------------- */
                  <div className="flex flex-col justify-between h-full w-full space-y-3">
                    <div>
                      {/* Header: Icon + Badge/Tag */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                          {card.icon}
                        </div>
                        {card.badge && (
                          <span className="text-[10px] font-mono font-medium text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            {card.badge}
                          </span>
                        )}
                      </div>

                      {/* Title & Tag */}
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-sm sm:text-base text-card-foreground tracking-tight">
                          {card.title}
                        </h3>
                        {card.tag && (
                          <p className="text-[11px] font-mono text-muted-foreground/80">
                            {card.tag}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <p className={cn(
                        "text-xs text-muted-foreground mt-2 leading-relaxed",
                        layout === "stack" && "line-clamp-3",
                        layout === "grid" && "line-clamp-3",
                        layout === "list" && "line-clamp-2",
                      )}>
                        {card.description}
                      </p>
                    </div>

                    {/* Footer accent */}
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground/60 font-mono">
                      <span>LumaCV Architecture</span>
                      <span className="text-primary font-medium">Active</span>
                    </div>
                  </div>
                )}

                {/* Tactile Stack Hint on Active Card */}
                {isTopCard && layout === "stack" && (
                  <div className="absolute bottom-2.5 left-0 right-0 text-center pointer-events-none">
                    <span className="text-[10px] font-medium text-muted-foreground/80 bg-background/90 px-3 py-0.5 rounded-full border border-border/50 backdrop-blur-md shadow-2xs">
                      ← Swipe horizontally or click dots to cycle →
                    </span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </LayoutGroup>

      {/* Smooth Tactile Pagination Dots for Stack Mode */}
      {layout === "stack" && cards.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-2">
          {cards.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                index === activeIndex
                  ? "w-6 bg-primary shadow-xs"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Named alias as in original prompt
export const Component = MorphingCardStack
export default MorphingCardStack
