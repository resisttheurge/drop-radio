import chroma from 'chroma-js'
import {
  contrastToFontSizeArray,
  FontWeight,
  fontWeightToSize,
} from './apca-font-table.js'

export function findBestContrast(
  bg: chroma.Color,
  fgs: chroma.Color[],
  goal = 7
): chroma.Color {
  let best = bg
  let bestContrast = chroma.contrast(best, bg)
  for (const next of fgs) {
    const nextContrast = chroma.contrast(next, bg)
    if (nextContrast >= goal) {
      if (bestContrast < goal || nextContrast - goal < bestContrast - goal) {
        best = next
        bestContrast = nextContrast
      }
    } else if (nextContrast > bestContrast) {
      best = next
      bestContrast = nextContrast
    }
  }
  return best
}

export function findBestContrastAPCA(
  bg: chroma.Color,
  fgs: chroma.Color[],
  goal = 85
): chroma.Color {
  let best = bg
  let bestContrast = Math.abs(chroma.contrastAPCA(best, bg))
  for (const next of fgs) {
    const nextContrast = Math.abs(chroma.contrastAPCA(next, bg))
    if (nextContrast >= goal) {
      if (bestContrast < goal || nextContrast - goal < bestContrast - goal) {
        best = next
        bestContrast = nextContrast
      }
    } else if (nextContrast > bestContrast) {
      best = next
      bestContrast = nextContrast
    }
  }
  return best
}

export function findBestContrastForFontSizeAndWeight(
  color: chroma.Color,
  textCandidate: chroma.Color[],
  fontSize: number,
  fontWeight: FontWeight
) {
  let best = color
  let bestFontSize = fontWeightToSize(
    fontWeight,
    contrastToFontSizeArray(Math.abs(chroma.contrastAPCA(best, color)))
  )
  for (const next of textCandidate) {
    const nextFontSize = fontWeightToSize(
      fontWeight,
      contrastToFontSizeArray(Math.abs(chroma.contrastAPCA(next, color)))
    )
    if (
      (nextFontSize <= fontSize && nextFontSize > bestFontSize) ||
      nextFontSize < bestFontSize
    ) {
      best = next
      bestFontSize = nextFontSize
    }
  }
  return { fontWeight, fontSize, color: best.css() }
}
