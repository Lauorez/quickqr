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

    const content = text?.trim() || ' '
    QRCode.toCanvas(canvas, content, {
      width: size,
      margin,
      errorCorrectionLevel: ecc,
      color: { dark: darkColor, light: lightColor }
    }, (err) => {
      if (err) return console.error(err)
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      if (logo) {
        const W = canvas.width
        const L = Math.max(16, Math.min(W * logoRatio, W * 0.4))
        const pad = L * (logoPaddingRatio ?? 0.1)

        const x = (W - L) / 2
        const y = (W - L) / 2

        // Draw white rounded rect background to improve scannability
        ctx.save()
        if (logoRounded) {
          const r = Math.min(12, L * 0.2)
          roundRect(ctx, x - pad, y - pad, L + 2*pad, L + 2*pad, r)
          ctx.fillStyle = '#fff'
          ctx.fill()
          ctx.strokeStyle = 'rgba(0,0,0,0.06)'
          ctx.lineWidth = 1
          ctx.stroke()
        } else {
          ctx.fillStyle = '#fff'
          ctx.fillRect(x - pad, y - pad, L + 2*pad, L + 2*pad)
        }
        ctx.restore()

        // Draw the logo image centered
        ctx.drawImage(logo, x, y, L, L)
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
