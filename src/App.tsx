import { useMemo, useRef, useState } from 'react'
import QRCanvas, { type EccLevel } from './components/QRCanvas.tsx'
import Adsense from './components/Adsense.tsx'
import faviconSvg from './assets/favicon.svg'

type LogoState = {
  img: HTMLImageElement | null
  url: string | null
  name?: string
}

export default function App() {
  const [text, setText] = useState('https://example.com')
  const [size, setSize] = useState(512)
  const [margin, setMargin] = useState(2)
  const [darkColor, setDarkColor] = useState('#111827')     // slate-900
  const [lightColor, setLightColor] = useState('#ffffff')   // white
  const [ecc, setEcc] = useState<EccLevel>('H')             // High, better for logos
  const [logoRatio, setLogoRatio] = useState(0.25)
  const [logoPadRatio, setLogoPadRatio] = useState(0.12)
  const [logoRounded, setLogoRounded] = useState(true)

  const [logo, setLogo] = useState<LogoState>({ img: null, url: null })
  const [dataUrl, setDataUrl] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const canDownload = useMemo(() => Boolean(text?.trim()?.length), [text])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => setLogo({ img, url, name: file.name })
    img.src = url
  }

  function clearLogo() {
    if (logo.url) URL.revokeObjectURL(logo.url)
    setLogo({ img: null, url: null })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function downloadPNG() {
    if (!dataUrl) return
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `qr-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Favicon SVG as logo */}
          <span className="w-8 h-8 inline-block">
            <img src={faviconSvg} alt="QuickQR Logo" className="w-8 h-8" />
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">QuickQR</h1>
        </div>
      </header>

      <div className="grid md:grid-cols-5 gap-6 mb-6">
        {/* Controls */}
        <section className="card md:col-span-3">
          <div className="space-y-4">
            <div>
              <div className="label">Content</div>
              <textarea
                className="input h-28"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL or any text"
              />
              <p className="text-xs text-slate-500 mt-1">Tip: High error correction (H) is recommended when placing a logo.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="label">Size (px)</div>
                <input className="input" type="number" min={128} max={2048} step={32} value={size}
                       onChange={(e) => setSize(Number(e.target.value || 512))} />
              </div>
              <div>
                <div className="label">Quiet Zone (margin)</div>
                <input className="input" type="number" min={0} max={16} step={1} value={margin}
                       onChange={(e) => setMargin(Number(e.target.value || 2))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="label">Foreground</div>
                <input type="color" className="input h-10" value={darkColor}
                       onChange={(e) => setDarkColor(e.target.value)} />
              </div>
              <div>
                <div className="label">Background</div>
                <input type="color" className="input h-10" value={lightColor}
                       onChange={(e) => setLightColor(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="label">ECC</div>
                <select className="input" value={ecc} onChange={(e) => setEcc(e.target.value as EccLevel)}>
                  <option value="L">L (7%)</option>
                  <option value="M">M (15%)</option>
                  <option value="Q">Q (25%)</option>
                  <option value="H">H (30%)</option>
                </select>
              </div>
              <div>
                <div className="label">Logo Size</div>
                <input type="range" min={0} max={0.4} step={0.01} value={logoRatio}
                       onChange={(e) => setLogoRatio(Number(e.target.value))} />
                <div className="text-xs text-slate-500">{Math.round(logoRatio * 100)}% of QR</div>
              </div>
              <div>
                <div className="label">Logo Padding</div>
                <input type="range" min={0} max={0.3} step={0.01} value={logoPadRatio}
                       onChange={(e) => setLogoPadRatio(Number(e.target.value))} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input id="rounded" type="checkbox" checked={logoRounded} onChange={(e) => setLogoRounded(e.target.checked)} />
              <label htmlFor="rounded" className="label m-0">Rounded logo background</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <div className="label">Logo image</div>
                <input ref={fileInputRef} className="input" type="file" accept="image/*" onChange={onFileChange} />
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={() => fileInputRef.current?.click()}>Choose file</button>
                <button className="btn" onClick={clearLogo} disabled={!logo.img}>Remove logo</button>
              </div>
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className="card flex flex-col gap-4 md:col-span-2">
          <div className="flex-1 grid md:grid-cols-2 gap-4">
            <div className="hidden">
              <QRCanvas
                text={text}
                size={size}
                margin={margin}
                darkColor={darkColor}
                lightColor={lightColor}
                ecc={ecc}
                logo={logo.img}
                logoRatio={logoRatio}
                logoPaddingRatio={logoPadRatio}
                logoRounded={logoRounded}
                onRender={setDataUrl}
              />
            </div>
            <div className="space-y-3">
              <div>
                <div className="label">Live preview</div>
                <div className="rounded-xl border overflow-hidden bg-white">
                  {dataUrl ? (
                    <img src={dataUrl} alt="QR preview" className="w-full h-auto" />
                  ) : (
                    <div className="p-6 text-slate-500 text-sm">No preview yet.</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" onClick={downloadPNG} disabled={!canDownload}>Download PNG</button>
                <button className="btn" onClick={() => navigator.clipboard.writeText(text)}>Copy text</button>
              </div>
              <p className="text-xs text-slate-500">
                Tip: Keep the logo under ~25% of the QR size and use high ECC (H) for best scan reliability.
              </p>
            </div>
          </div>

          {/* Ad slot under the preview */}
          <div className="pt-2 border-t">
            <Adsense slot="0000000000" />
          </div>
        </section>
      </div>

      {/* Bottom content + another ad */}
      <section className="card space-y-3">
        <h2 className="section-title">How it works</h2>
        <p className="text-slate-600">
          This app uses canvas rendering with high error correction to keep your QR codes scannable
          even when a logo is placed in the center. Everything runs locally in your browser.
        </p>
        <div className="pt-2 border-t">
          <Adsense slot="0000000001" />
        </div>
      </section>

      <footer className="text-center text-xs text-slate-500 mt-8">
        <nav>
          <a href="/about.html" className="mx-2 underline">About</a>
          <a href="/contact.html" className="mx-2 underline">Contact</a>
          <a href="/privacy.html" className="mx-2 underline">Privacy Policy</a>
        </nav>
        <div className="mt-2">
          &copy; {new Date().getFullYear()} QuickQR
        </div>
      </footer>
    </div>
  )
}