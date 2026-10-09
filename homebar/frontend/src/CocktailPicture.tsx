import { Image } from '@mantine/core'
import { label } from './labels'

// Liquid colour by the first Spirit Kind in the recipe; anything unlisted falls back to a hash of the name.
const LIQUID: Record<string, string> = {
  VODKA: '#cfe8f5', VANILLA_VODKA: '#f3e9c6', GIN: '#c9efe3', WHITE_RUM: '#f1eedd', DARK_RUM: '#b0652d',
  OVERPROOF_RUM: '#d99a4e', TEQUILA: '#f3dd8c', REPOSADO_TEQUILA: '#e8b85a', MEZCAL: '#d8c48b', WHISKEY: '#c98a2e',
  BOURBON: '#c0762a', RYE_WHISKEY: '#b8651f', IRISH_WHISKEY: '#d9a13f', BLENDED_SCOTCH: '#c98d36',
  ISLAY_SCOTCH: '#b97a2b', BRANDY: '#b5601f', CALVADOS: '#d89a3a', PISCO: '#efe3b0', SWEET_VERMOUTH: '#8d2f2f',
  DRY_VERMOUTH: '#e7e0b0', CAMPARI: '#d6232f', APEROL: '#f0652a', LILLET_BLANC: '#ecd88a', TRIPLE_SEC: '#f6c35b',
  COFFEE_LIQUEUR: '#3b2418', AMARETTO: '#b8742f', CREME_DE_CASSIS: '#5a1f4a', CREME_DE_MENTHE: '#3fc58a',
  GREEN_CHARTREUSE: '#8fd14f', ABSINTHE: '#9bdc6c', CHAMPAGNE: '#f0df9a', PROSECCO: '#efe09a',
}

function hash(text: string) {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

type GlassProps = { cup: string | null; liquid: string; ice: boolean }

/** Simple line-art glasses, all drawn in a 100×100 box. */
function Glass({ cup, liquid, ice }: GlassProps) {
  const stroke = { stroke: 'rgba(255,255,255,0.9)', strokeWidth: 2.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  const iceCubes = (x: number, y: number, w: number) =>
    ice ? (
      <g fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2">
        <rect x={x + w * 0.1} y={y} width={w * 0.34} height={w * 0.34} rx="3" transform={`rotate(-12 ${x + w * 0.27} ${y})`} />
        <rect x={x + w * 0.52} y={y + 4} width={w * 0.32} height={w * 0.32} rx="3" transform={`rotate(10 ${x + w * 0.68} ${y})`} />
      </g>
    ) : null

  switch (cup) {
    case 'MARTINI':
      return (
        <g>
          <path d="M18 24 H82 L50 58 Z" fill={liquid} fillOpacity="0.85" />
          <path d="M18 24 H82 L50 58 Z M50 58 V84 M34 84 H66" fill="none" {...stroke} />
          <circle cx="58" cy="33" r="4" fill="#5fa84a" />
        </g>
      )
    case 'COUPE':
      return (
        <g>
          <path d="M20 34 H80 C80 52 66 60 50 60 C34 60 20 52 20 34 Z" fill={liquid} fillOpacity="0.85" />
          <path d="M20 34 H80 C80 52 66 60 50 60 C34 60 20 52 20 34 Z M50 60 V84 M34 84 H66" fill="none" {...stroke} />
        </g>
      )
    case 'WINE':
      return (
        <g>
          <path d="M28 20 H72 C74 46 64 58 50 58 C36 58 26 46 28 20 Z" fill="rgba(255,255,255,0.12)" />
          <path d="M27 36 H73 C72 50 63 58 50 58 C37 58 28 50 27 36 Z" fill={liquid} fillOpacity="0.85" />
          <path d="M28 20 H72 C74 46 64 58 50 58 C36 58 26 46 28 20 Z M50 58 V84 M34 84 H66" fill="none" {...stroke} />
          {iceCubes(34, 38, 30)}
        </g>
      )
    case 'CHAMPAGNE':
      return (
        <g>
          <path d="M36 14 H64 C65 40 60 54 50 58 C40 54 35 40 36 14 Z" fill="rgba(255,255,255,0.12)" />
          <path d="M36.4 26 H63.6 C63.8 44 59 54 50 58 C41 54 36.2 44 36.4 26 Z" fill={liquid} fillOpacity="0.85" />
          <path d="M36 14 H64 C65 40 60 54 50 58 C40 54 35 40 36 14 Z M50 58 V84 M34 84 H66" fill="none" {...stroke} />
          <g fill="rgba(255,255,255,0.8)">
            <circle cx="47" cy="44" r="1.4" />
            <circle cx="53" cy="36" r="1.4" />
            <circle cx="48" cy="30" r="1.2" />
          </g>
        </g>
      )
    case 'HIGHBALL_COLLINS':
      return (
        <g>
          <path d="M33 14 H67 L64 84 H36 Z" fill="rgba(255,255,255,0.12)" />
          <path d="M34 28 H66 L64 84 H36 Z" fill={liquid} fillOpacity="0.85" />
          <path d="M33 14 H67 L64 84 H36 Z" fill="none" {...stroke} />
          {iceCubes(38, 34, 24)}
          <path d="M58 6 L54 40" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </g>
      )
    case 'HURRICANE':
      return (
        <g>
          <path d="M34 16 H66 C66 28 56 34 56 46 C56 58 66 62 66 72 C66 80 60 84 50 84 C40 84 34 80 34 72 C34 62 44 58 44 46 C44 34 34 28 34 16 Z" fill={liquid} fillOpacity="0.8" />
          <path d="M34 16 H66 C66 28 56 34 56 46 C56 58 66 62 66 72 C66 80 60 84 50 84 C40 84 34 80 34 72 C34 62 44 58 44 46 C44 34 34 28 34 16 Z" fill="none" {...stroke} />
        </g>
      )
    default: // OLD_FASHIONED, or no cup listed
      return (
        <g>
          <path d="M26 30 H74 L69 82 H31 Z" fill="rgba(255,255,255,0.12)" />
          <path d="M27 42 H73 L69 82 H31 Z" fill={liquid} fillOpacity="0.85" />
          <path d="M26 30 H74 L69 82 H31 Z" fill="none" {...stroke} />
          {iceCubes(33, 46, 34)}
        </g>
      )
  }
}

type Props = {
  name: string
  imageUrl: string | null
  cup: string | null
  categories: string[]
  iceInCup: boolean
  height: number
  /** Show the whole photo, however it is shaped, instead of cropping it to the height. */
  full?: boolean
}

/** The Cocktail's photo, or, when it has none, a drawn glass tinted by its main spirit. */
export default function CocktailPicture({ name, imageUrl, cup, categories, iceInCup, height, full }: Props) {
  if (imageUrl && full) {
    return (
      <div className="picture-full">
        <div className="picture-full-backdrop" style={{ backgroundImage: `url(${imageUrl})` }} />
        <img src={imageUrl} alt={name} />
      </div>
    )
  }
  if (imageUrl) return <Image src={imageUrl} h={height} alt={name} loading="lazy" />

  const seed = hash(name)
  const hue = seed % 360
  const liquid = (categories[0] && LIQUID[categories[0]]) || `hsl(${hue} 70% 70%)`

  return (
    <svg viewBox="0 0 100 100" width="100%" height={height} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${name}${cup ? `, served in a ${label(cup).toLowerCase()} glass` : ''}`}>
      <defs>
        <linearGradient id={`bg-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 45% 30%)`} />
          <stop offset="1" stopColor={`hsl(${(hue + 50) % 360} 50% 18%)`} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#bg-${seed})`} />
      <circle cx="82" cy="18" r="22" fill="rgba(255,255,255,0.06)" />
      <circle cx="12" cy="90" r="26" fill="rgba(255,255,255,0.05)" />
      <g transform="translate(0 2)">
        <Glass cup={cup} liquid={liquid} ice={iceInCup} />
      </g>
    </svg>
  )
}
