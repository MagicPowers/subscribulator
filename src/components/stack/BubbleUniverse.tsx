import { forceCollide, forceManyBody, forceSimulation, forceX, forceY, type Simulation, type SimulationNodeDatum } from 'd3-force'
import { Orbit, Shuffle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cycleInfo } from '../../lib/money'
import type { Subscription } from '../../lib/types'
import { clamp, visibleOn, withAlpha } from '../../lib/utils'
import { useMoney, useStats } from '../../store/derived'
import { useUI } from '../../store/useUI'
import { SubLogo } from '../BrandLogo'
import { Button } from '../ui/Button'
import { Card, CardHeader } from '../ui/Card'

interface Node extends SimulationNodeDatum {
  id: string
  r: number
}

/** Physics bubbles: each subscription's area is proportional to what it costs. Drag them around. */
export function BubbleUniverse() {
  const stats = useStats()
  const openEditor = useUI((s) => s.openEditor)
  const money = useMoney()
  const boxRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef(new Map<string, Node>())
  const elsRef = useRef(new Map<string, HTMLDivElement>())
  const simRef = useRef<Simulation<Node, undefined> | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const bubbles = useMemo(() => {
    if (!size.w || !stats.monthly) return []
    const k = Math.sqrt((size.w * size.h * 0.4) / (Math.PI * stats.monthly))
    const maxR = Math.min(size.w, size.h) * 0.3
    return stats.items.map((item) => ({ ...item, r: clamp(k * Math.sqrt(item.monthly), 17, maxR) }))
  }, [stats, size])

  useEffect(() => {
    if (!size.w || !bubbles.length) return
    const previous = nodesRef.current
    const next = new Map<string, Node>()
    const nodes = bubbles.map((b) => {
      const node: Node = previous.get(b.sub.id) ?? {
        id: b.sub.id,
        r: b.r,
        x: size.w / 2 + (Math.random() - 0.5) * size.w * 0.6,
        y: -b.r - Math.random() * 80,
      }
      node.r = b.r
      next.set(node.id, node)
      return node
    })
    nodesRef.current = next

    const place = () => {
      for (const n of nodes) {
        n.x = clamp(n.x ?? 0, n.r, size.w - n.r)
        n.y = clamp(n.y ?? 0, n.r - 200, size.h - n.r)
        const el = elsRef.current.get(n.id)
        if (el) el.style.transform = `translate3d(${n.x - n.r}px, ${n.y - n.r}px, 0)`
      }
    }

    const sim = forceSimulation(nodes)
      .force('x', forceX<Node>(size.w / 2).strength(0.045))
      .force('y', forceY<Node>(size.h / 2).strength(0.08))
      .force('charge', forceManyBody<Node>().strength(-6))
      .force('collide', forceCollide<Node>((d) => d.r + 3).strength(0.95).iterations(3))
      .alpha(previous.size ? 0.6 : 1)
      .alphaDecay(0.018)
      .on('tick', place)
    place()
    simRef.current = sim
    return () => {
      sim.stop()
    }
  }, [bubbles, size])

  const shake = () => {
    for (const n of nodesRef.current.values()) {
      n.vx = (Math.random() - 0.5) * 30
      n.vy = (Math.random() - 0.5) * 30
    }
    simRef.current?.alpha(0.9).restart()
  }

  const drag = (sub: Subscription) => (event: React.PointerEvent<HTMLDivElement>) => {
    const node = nodesRef.current.get(sub.id)
    const box = boxRef.current?.getBoundingClientRect()
    const sim = simRef.current
    if (!node || !box || !sim) return
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    const start = { x: event.clientX, y: event.clientY }
    let moved = false
    node.fx = node.x
    node.fy = node.y
    sim.alphaTarget(0.25).restart()

    const onMove = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 4) moved = true
      node.fx = clamp(e.clientX - box.left, node.r, box.width - node.r)
      node.fy = clamp(e.clientY - box.top, node.r, box.height - node.r)
    }
    const onUp = () => {
      node.fx = null
      node.fy = null
      sim.alphaTarget(0)
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerup', onUp)
      target.removeEventListener('pointercancel', onUp)
      if (!moved) openEditor(sub.id)
    }
    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerup', onUp)
    target.addEventListener('pointercancel', onUp)
  }

  const hoveredItem = stats.items.find((i) => i.sub.id === hovered)

  return (
    <Card className="flex flex-col p-5">
      <CardHeader
        icon={<Orbit className="size-4" />}
        title="Subscription universe"
        subtitle="Bigger bubble, bigger bill. Drag them about, tap one to edit."
        action={
          <Button size="iconSm" variant="ghost" onClick={shake} aria-label="Shake the bubbles">
            <Shuffle />
          </Button>
        }
      />
      <div ref={boxRef} className="relative mt-4 h-[440px] flex-1 overflow-hidden rounded-[22px] bg-black/20 ring-1 ring-white/[0.05]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{ background: 'radial-gradient(60% 50% at 50% 55%, color-mix(in oklab, var(--heat-b) 18%, transparent), transparent)' }}
        />
        {bubbles.map(({ sub, r, monthly }) => {
          const accent = visibleOn(sub.color)
          return (
            <div
              key={sub.id}
              ref={(el) => {
                if (el) elsRef.current.set(sub.id, el)
                else elsRef.current.delete(sub.id)
              }}
              onPointerDown={drag(sub)}
              onPointerEnter={() => setHovered(sub.id)}
              onPointerLeave={() => setHovered((h) => (h === sub.id ? null : h))}
              className="absolute top-0 left-0 cursor-grab touch-none will-change-transform active:cursor-grabbing"
              style={{ width: r * 2, height: r * 2, transform: 'translate3d(-999px, -999px, 0)' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: hovered === sub.id ? 1.06 : 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="relative size-full rounded-full"
                style={{ boxShadow: `0 14px 40px -12px ${withAlpha(accent, 0.75)}, 0 0 0 1px ${withAlpha(accent, 0.35)}` }}
              >
                <SubLogo sub={sub} size={r * 2} shape="circle" scale={0.5} />
                {r > 40 && (
                  <span className="pointer-events-none absolute bottom-[13%] left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-white backdrop-blur-sm">
                    {money(monthly)}
                  </span>
                )}
              </motion.div>
            </div>
          )
        })}

        <AnimatePresence>
          {hoveredItem && (
            <motion.div
              key={hoveredItem.sub.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="glass-strong pointer-events-none absolute bottom-3 left-3 rounded-2xl px-3.5 py-2.5"
            >
              <p className="text-sm font-medium text-white">{hoveredItem.sub.name}</p>
              <p className="font-mono text-xs text-zinc-400">
                {money(hoveredItem.sub.price)}
                {cycleInfo(hoveredItem.sub.cycle).short} · {Math.round(hoveredItem.share * 100)}% of your total
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}
