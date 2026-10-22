import type { SVGProps } from 'react'

/**
 * Iconos en línea (trazo estilo Lucide) dibujados a mano para no cargar una
 * librería entera: se usa `currentColor` y heredan el tamaño del texto.
 */

type IconProps = SVGProps<SVGSVGElement>

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const HomeIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m3 10.5 9-7.5 9 7.5" />
    <path d="M5 9.3V21h14V9.3" />
    <path d="M9.5 21v-6h5v6" />
  </Svg>
)

export const WalletIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="6" width="18" height="13" rx="3" />
    <path d="M3 10.5h18" />
    <circle cx="16.8" cy="14.8" r="1.2" />
  </Svg>
)

export const PieChartIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M21.2 15.9A10 10 0 1 1 8 2.8" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </Svg>
)

export const BulbIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9.5 18.5h5" />
    <path d="M10 21.5h4" />
    <path d="M12 2.5a6.5 6.5 0 0 0-3.8 11.8v2.2h7.6v-2.2A6.5 6.5 0 0 0 12 2.5Z" />
  </Svg>
)

export const SlidersIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 6h9" />
    <path d="M18.5 6H20" />
    <circle cx="15.8" cy="6" r="2.2" />
    <path d="M4 12h3.5" />
    <path d="M12 12h8" />
    <circle cx="9.8" cy="12" r="2.2" />
    <path d="M4 18h9" />
    <path d="M18.5 18H20" />
    <circle cx="15.8" cy="18" r="2.2" />
  </Svg>
)

export const PlusIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
)

export const CloseIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
)

export const TrashIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3.5 6h17" />
    <path d="M8.5 6V4.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5V6" />
    <path d="M6 6v13.5A2.5 2.5 0 0 0 8.5 22h7a2.5 2.5 0 0 0 2.5-2.5V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </Svg>
)

export const DownloadIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3.5v11" />
    <path d="m7.5 10 4.5 4.5 4.5-4.5" />
    <path d="M4.5 20.5h15" />
  </Svg>
)

export const CheckIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m5 13 4 4L19 7" />
  </Svg>
)

export const ChevronDownIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m6 9.5 6 6 6-6" />
  </Svg>
)

export const PencilIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 20h9" />
    <path d="M16.6 3.6a2.1 2.1 0 0 1 3 3L7.5 18.7 3.5 19.9l1.2-4Z" />
  </Svg>
)

export const TargetIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.4" />
  </Svg>
)

export const CalendarIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <path d="M3 10h18" />
  </Svg>
)

export const ShieldIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3 5 6v6c0 4.4 2.9 8.4 7 9.5 4.1-1.1 7-5.1 7-9.5V6l-7-3Z" />
    <path d="m9.2 12 2 2 3.6-3.8" />
  </Svg>
)

export const GlobeIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.2 12h17.6" />
    <path d="M12 3c2.4 2.6 3.7 5.6 3.7 9S14.4 18.4 12 21c-2.4-2.6-3.7-5.6-3.7-9S9.6 5.6 12 3Z" />
  </Svg>
)

export const TrendingUpIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m3 16.5 6-6 4 4 7.5-7.5" />
    <path d="M15 7h5.5v5.5" />
  </Svg>
)

export const SunIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
  </Svg>
)

export const MoonIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </Svg>
)

export const DeviceIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="4" y="2.5" width="16" height="19" rx="3" />
    <path d="M10.5 18.5h3" />
  </Svg>
)

export const BarChartIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 4v16h16" />
    <rect x="7" y="12" width="3" height="5" rx="1" />
    <rect x="12" y="8" width="3" height="9" rx="1" />
    <rect x="17" y="5" width="3" height="12" rx="1" />
  </Svg>
)

export const GaugeIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 17a8 8 0 1 1 16 0" />
    <path d="M12 17 15.5 11" />
    <circle cx="12" cy="17" r="1.4" />
  </Svg>
)

export const LayersIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
    <path d="m3 12.5 9 4.5 9-4.5" />
    <path d="m3 17 9 4.5L21 17" />
  </Svg>
)

export const SparklesIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3.2 13.6 8l4.8 1.6-4.8 1.6L12 16l-1.6-4.8L5.6 9.6 10.4 8 12 3.2Z" />
    <path d="m18.5 14.5.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
    <path d="m5.5 3 .6 1.6L7.7 5.2l-1.6.6L5.5 7.4l-.6-1.6L3.3 5.2l1.6-.6L5.5 3Z" />
  </Svg>
)

export const AlertTriangleIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3.1L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 16.2h.01" />
  </Svg>
)

export const InfoIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 7.6h.01" />
  </Svg>
)

export const UploadIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 20.5v-11" />
    <path d="m7.5 14 4.5-4.5 4.5 4.5" />
    <path d="M4.5 3.5h15" />
  </Svg>
)

export const ChevronLeftIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m14.5 6-6 6 6 6" />
  </Svg>
)

export const ChevronRightIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m9.5 6 6 6-6 6" />
  </Svg>
)

export const ArrowRightIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 12h15" />
    <path d="m13.5 6.5 5.5 5.5-5.5 5.5" />
  </Svg>
)

export const RotateIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3.5 8.5A9 9 0 1 1 3 14" />
    <path d="M3.5 3.5v5h5" />
  </Svg>
)

export const BookIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17.5H6.5A2.5 2.5 0 0 0 4 22V4.5Z" />
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M8 6.5h8" />
    <path d="M8 10h5" />
  </Svg>
)

export const HeartIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.8l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-7.4a5.5 5.5 0 0 0 0-7.8Z" />
  </Svg>
)
