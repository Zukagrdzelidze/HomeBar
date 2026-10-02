import { Portal, Text, VisuallyHidden } from '@mantine/core'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DiceIcon } from '../icons'

const LINE = 64 // px per name; keep in step with .reel-item in styles.css
const SPIN_MS = 1700
const HOLD_MS = 900
const FADE_MS = 250
const FILLERS = 22
const SPARKS = 14

type Phase = 'ready' | 'spinning' | 'landed' | 'leaving'

type Props = {
  /** Names to spin past; any may repeat. */
  pool: string[]
  /** The name the reel stops on. */
  pick: string
  /** Called once the reel has landed and held, as it starts fading out. */
  onPick: () => void
  onClose: () => void
}

/** Shuffled names, the pick, then one more so the slot below the pick isn't empty. */
function reelNames(pool: string[], pick: string): string[] {
  const random = () => pool[Math.floor(Math.random() * pool.length)]
  const names: string[] = []
  while (names.length < FILLERS) {
    const name = random()
    // Avoid the same name twice in a row where the pool allows it.
    if (pool.length < 2 || name !== names.at(-1)) names.push(name)
  }
  if (pool.length > 1 && names.at(-1) === pick) names[names.length - 1] = pool.find((name) => name !== pick)!
  return [...names, pick, random()]
}

/** A slot-machine spin through the menu that lands on the Surprise me pick. Tap or Esc skips ahead. */
export default function SurpriseReel({ pool, pick, onPick, onClose }: Props) {
  const [names] = useState(() => reelNames(pool, pick))
  const [phase, setPhase] = useState<Phase>('ready')
  const [skipped, setSkipped] = useState(false)
  const pickIndex = names.length - 2
  // The page re-renders while the reel runs; read its latest callbacks without restarting the timers.
  const callbacks = useRef({ onPick, onClose })
  useLayoutEffect(() => {
    callbacks.current = { onPick, onClose }
  })

  useEffect(() => {
    if (phase === 'ready') {
      const timer = setTimeout(() => setPhase('spinning'), 30) // one paint at the top, so the spin animates
      return () => clearTimeout(timer)
    }
    if (phase === 'spinning') {
      const timer = setTimeout(() => setPhase('landed'), SPIN_MS)
      return () => clearTimeout(timer)
    }
    if (phase === 'landed') {
      navigator.vibrate?.(15)
      const timer = setTimeout(() => {
        callbacks.current.onPick()
        setPhase('leaving')
      }, HOLD_MS)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => callbacks.current.onClose(), FADE_MS)
    return () => clearTimeout(timer)
  }, [phase])

  const skip = () => {
    if (phase === 'ready' || phase === 'spinning') {
      setSkipped(true)
      setPhase('landed')
    } else if (phase === 'landed') {
      onPick()
      setPhase('leaving')
    }
  }

  // Captured first, so Esc skips the reel instead of also closing a drink's dialog underneath.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (['Escape', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        event.stopPropagation()
        skip()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const landed = phase === 'landed' || phase === 'leaving'
  const index = phase === 'ready' ? 0 : pickIndex

  return (
    <Portal>
      <div
        className="reel-backdrop"
        data-landed={landed || undefined}
        data-leaving={phase === 'leaving' || undefined}
        onClick={skip}
        role="presentation"
      >
        <DiceIcon size={40} className="reel-dice" data-rolling={!landed || undefined} />
        <Text className="eyebrow" mt="lg">
          {landed ? 'Tonight you’re having' : 'Shaking one up…'}
        </Text>
        <div className="reel-stage" aria-hidden>
          <div className="reel-window">
            <div
              className="reel-strip"
              style={{
                transform: `translateY(${LINE - index * LINE}px)`,
                transition: phase === 'spinning' && !skipped ? `transform ${SPIN_MS}ms cubic-bezier(0.1, 0.7, 0.1, 1)` : 'none',
              }}
            >
              {names.map((name, i) => (
                <div key={i} className="reel-item" data-landed={(landed && i === pickIndex) || undefined}>
                  {name}
                </div>
              ))}
            </div>
          </div>
          {landed && (
            <span className="reel-burst">
              {Array.from({ length: SPARKS }, (_, spark) => (
                <span
                  key={spark}
                  style={{
                    ['--angle' as string]: `${(spark * 360) / SPARKS}deg`,
                    ['--distance' as string]: `${90 + (spark % 3) * 35}px`,
                  }}
                />
              ))}
            </span>
          )}
        </div>
        <Text size="sm" c="rgba(243, 237, 226, 0.5)" mt="lg" style={{ visibility: landed ? 'hidden' : 'visible' }}>
          Tap to skip
        </Text>
        <VisuallyHidden role="status">{landed ? `Tonight you’re having ${pick}` : ''}</VisuallyHidden>
      </div>
    </Portal>
  )
}
