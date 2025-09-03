import { useEffect, useRef } from 'react'


type Props = {
slot: string
format?: string
style?: React.CSSProperties
className?: string
}


// Renders a single AdSense ad unit.
// Ensure the AdSense script is present in index.html (with your real client ID).
export default function Adsense({ slot, format = 'auto', style, className }: Props) {
const ref = useRef<HTMLModElement>(null)


useEffect(() => {
try {
// @ts-ignore
(window.adsbygoogle = window.adsbygoogle || []).push({})
} catch (e) {
// Ad blockers or script not loaded; silently ignore
}
}, [])


return (
<ins
className={`adsbygoogle block ${className || ''}`}
style={style || { display: 'block' }}
data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // <-- replace with your publisher ID
data-ad-slot={slot} // <-- replace with your ad slot ID
data-ad-format={format}
data-full-width-responsive="true"
ref={ref as any}
/>
)
}