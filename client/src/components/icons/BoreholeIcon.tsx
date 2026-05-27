// src/components/icons/BoreholeIcon.tsx
import { LucideProps } from 'lucide-react'

export const BoreholeIcon = ({ className, ...props }: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Ground surface with grass */}
    <path d="M2 5L22 5" strokeWidth="2" />
    <path d="M3 5L4 3L5 5" fill="currentColor" stroke="none" />
    <path d="M8 5L9 3L10 5" fill="currentColor" stroke="none" />
    <path d="M14 5L15 3L16 5" fill="currentColor" stroke="none" />
    <path d="M19 5L20 3L21 5" fill="currentColor" stroke="none" />
    
    {/* Soil layers with texture */}
    <path d="M2 7L22 7" strokeDasharray="3 3" strokeWidth="1" opacity="0.5" />
    <path d="M2 9L22 9" strokeDasharray="2 4" strokeWidth="1" opacity="0.4" />
    <path d="M2 11L22 11" strokeDasharray="4 2" strokeWidth="1" opacity="0.3" />
    <path d="M2 13L22 13" strokeDasharray="2 3" strokeWidth="1" opacity="0.35" />
    
    {/* Borehole casing - steel pipe */}
    <rect x="10.5" y="5" width="3" height="14" rx="0.5" strokeWidth="1.5" />
    <rect x="10" y="5" width="4" height="1" fill="currentColor" stroke="none" opacity="0.3" />
    <rect x="10" y="8" width="4" height="0.5" fill="currentColor" stroke="none" opacity="0.2" />
    <rect x="10" y="11" width="4" height="0.5" fill="currentColor" stroke="none" opacity="0.2" />
    <rect x="10" y="14" width="4" height="0.5" fill="currentColor" stroke="none" opacity="0.2" />
    
    {/* Water table indicator */}
    <path d="M8 15L16 15" stroke="#009dff" strokeWidth="2" opacity="0.7" />
    <path d="M9 16L15 16" stroke="#009dff" strokeWidth="1.5" opacity="0.5" />
    
    {/* Water inside borehole */}
    <path d="M11 15L11 19" stroke="#009dff" strokeWidth="1.5" opacity="0.6" />
    <path d="M13 15L13 19" stroke="#009dff" strokeWidth="1.5" opacity="0.6" />
    
    {/* Water waves/ripples */}
    <path d="M10.5 16C11 15.5 12 15.5 12.5 16" stroke="#009dff" fill="none" strokeWidth="1" />
    <path d="M10.5 17.5C11 17 12 17 12.5 17.5" stroke="#009dff" fill="none" strokeWidth="1" />
    
    {/* Water drop */}
    <path d="M11 19.5L12 21.5L13 19.5" fill="#009dff" stroke="none" opacity="0.8" />
    
    {/* Pump suction line */}
    <path d="M14 11L17 11L17 7" strokeWidth="1.5" />
    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    
    {/* Groundwater indicator arrows */}
    <path d="M7 17L5 17" stroke="#00a3ff" strokeWidth="1" opacity="0.5" />
    <path d="M6 16.5L5 17L6 17.5" fill="none" stroke="#00a3ff" strokeWidth="0.8" opacity="0.5" />
    <path d="M17 17L19 17" stroke="#00a3ff" strokeWidth="1" opacity="0.5" />
    <path d="M18 16.5L19 17L18 17.5" fill="none" stroke="#00a3ff" strokeWidth="0.8" opacity="0.5" />
    
    {/* Depth markings on casing */}
    <line x1="10" y1="6" x2="9" y2="6" strokeWidth="0.8" />
    <line x1="10" y1="9" x2="9" y2="9" strokeWidth="0.8" />
    <line x1="10" y1="12" x2="9" y2="12" strokeWidth="0.8" />
    
    {/* Aquifer symbol at bottom */}
    <path d="M7.5 18C9 17 15 17 16.5 18" strokeWidth="1" opacity="0.4" />
    <path d="M8 19C10 18 14 18 16 19" strokeWidth="1" opacity="0.3" />
  </svg>
)

export default BoreholeIcon