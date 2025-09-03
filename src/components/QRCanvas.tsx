import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export type EccLevel = 'L' | 'M' | 'Q' | 'H'

export type QRCanvasProps = {
  text: string
  size: number
  margin: number
  darkColor: string
  lightColor: string
  ecc: EccLevel
  logo?: HTMLImageElement | null
  logoRatio?: number          // 0..0.4 (portion of canvas width used by logo)
  logoPaddingRatio?: number   // white padding around logo relative to logo size
  logoRounded?: boolean
  onRender?: (dataUrl: string) => void
}

export default function QRCanvas({
  text,
  size,
  margin,
  darkColor,
  lightColor,
  ecc,
  logo,
  logoRatio = 0.2,
  logoPaddingRatio = 0.1,
  logoRounded = true,
  onRender
}: QRCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const content = text?.trim() || ' '
    QRCode.toCanvas(canvas, content, {
      width: size,
      margin,
      errorCorrectionLevel: ecc,
      color: { dark: darkColor, light: lightColor }
    }, (err) => {
      if (err) return console.error(err)

      // Draw logo if present
      if (logo && logoRatio > 0) {
        const L = size * logoRatio
        const pad = L * logoPaddingRatio
        const logoW = logo.width
        const logoH = logo.height
        const aspect = logoW / logoH

        // The total "hole" (logo + padding) is L x L
        // The logo itself fits inside (L - 2*pad) x (L - 2*pad), but
        // we want the padding to expand the white area, not shrink the logo.

        // Calculate logo size so logo stays the same size regardless of padding
        let drawW = L
        let drawH = L

        if (aspect > 1) {
          drawW = L
          drawH = L / aspect
        } else if (aspect < 1) {
          drawH = L
          drawW = L * aspect
        }

        // Center the white padding "hole"
        const holeW = drawW + 2 * pad
        const holeH = drawH + 2 * pad
        const holeX = (size - holeW) / 2
        const holeY = (size - holeH) / 2

        // Center the logo inside the hole
        const x = holeX + pad
        const y = holeY + pad

        ctx.save()
        if (logoRounded) {
          roundRect(ctx, holeX, holeY, holeW, holeH, holeH * 0.25)
          ctx.fillStyle = '#fff'
          ctx.fill()
          ctx.clip()
        } else {
          ctx.fillStyle = '#fff'
          ctx.fillRect(holeX, holeY, holeW, holeH)
          ctx.beginPath()
          ctx.rect(x, y, drawW, drawH)
          ctx.clip()
        }

        ctx.drawImage(logo, x, y, drawW, drawH)
        ctx.restore()
      }

      if (onRender) {
        try {
          onRender(canvas.toDataURL('image/png'))
        } catch {}
      }
    })
  }, [text, size, margin, darkColor, lightColor, ecc, logo, logoRatio, logoPaddingRatio, logoRounded])

  return <canvas ref={canvasRef} width={size} height={size} className="w-full h-auto rounded-xl border border-slate-200 bg-white" />
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const min = Math.min(w, h) / 2
  if (r > min) r = min
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
