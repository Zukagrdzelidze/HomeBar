import { Badge, Card, Chip, createTheme, type CSSVariablesResolver, Modal, Paper } from '@mantine/core'

// A warm, quiet palette: brass for accents, near-black with a hint of brown for dark surfaces.
export const theme = createTheme({
  primaryColor: 'brass',
  primaryShade: { light: 7, dark: 5 },
  colors: {
    brass: ['#fbf6ec', '#f3e8cf', '#e8d3a3', '#dcbd74', '#d2aa4e', '#c8972a', '#b5871f', '#9c7416', '#836110', '#6b4f0b'],
    dark: ['#d6d0c6', '#b3ada3', '#8c867c', '#5f5a53', '#3d3833', '#2d2925', '#221f1c', '#1a1816', '#141210', '#0e0c0b'],
  },
  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
  headings: { fontFamily: 'Fraunces, Georgia, serif', fontWeight: '600' },
  defaultRadius: 'md',
  components: {
    Badge: Badge.extend({
      defaultProps: { radius: 'sm' },
      styles: { root: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 } },
    }),
    Card: Card.extend({ defaultProps: { radius: 'lg' } }),
    Paper: Paper.extend({ defaultProps: { radius: 'lg' } }),
    Chip: Chip.extend({ defaultProps: { size: 'sm' } }),
    Modal: Modal.extend({ defaultProps: { radius: 'lg', overlayProps: { blur: 3, backgroundOpacity: 0.55 } } }),
  },
})

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: { '--mantine-color-body': '#faf8f4' },
  dark: {},
})
