// src/components/icons/WaterTowerIcon.tsx
import { LucideProps } from 'lucide-react'

export const WaterTowerIcon = ({ className, ...props }: LucideProps) => (
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
    {/* Ground/Base */}
    <path d="M4 22L20 22" strokeWidth="2" />
    <path d="M5 22L6 19L18 19L19 22" fill="currentColor" stroke="none" opacity="0.15" />
    
    {/* Concrete base/pad */}
    <rect x="7" y="18" width="10" height="2" rx="0.5" fill="currentColor" stroke="none" opacity="0.2" />
    
    {/* Support legs (4-leg tower design) */}
    {/* Left front leg */}
    <line x1="8" y1="18" x2="10" y2="10" strokeWidth="1.2" />
    {/* Right front leg */}
    <line x1="16" y1="18" x2="14" y2="10" strokeWidth="1.2" />
    {/* Left back leg (slightly offset) */}
    <line x1="9" y1="18" x2="9.5" y2="10" strokeWidth="0.8" opacity="0.5" />
    {/* Right back leg (slightly offset) */}
    <line x1="15" y1="18" x2="14.5" y2="10" strokeWidth="0.8" opacity="0.5" />
    
    {/* Cross bracing on legs */}
    <line x1="9" y1="15" x2="15" y2="15" strokeWidth="0.8" opacity="0.6" />
    <line x1="9.5" y1="12" x2="14.5" y2="12" strokeWidth="0.8" opacity="0.6" />
    <line x1="9" y1="14" x2="15" y2="17" strokeWidth="0.5" opacity="0.4" />
    <line x1="15" y1="14" x2="9" y2="17" strokeWidth="0.5" opacity="0.4" />
    
    {/* Tank platform/deck */}
    <rect x="8.5" y="9" width="7" height="0.8" rx="0.2" fill="currentColor" stroke="none" opacity="0.3" />
    
    {/* Water Tank Body */}
    <rect x="9" y="4" width="6" height="5" rx="0.8" strokeWidth="1.5" />
    
    {/* Tank dome/roof */}
    <path d="M9 4.5C9 2.5 15 2.5 15 4.5" fill="currentColor" stroke="none" opacity="0.15" />
    <path d="M9 4.5C9 3.2 10.5 2.5 12 2.5C13.5 2.5 15 3.2 15 4.5" fill="none" strokeWidth="1.2" />
    
    {/* Vent pipe on top */}
    <line x1="12" y1="2.5" x2="12" y2="1.5" strokeWidth="1" />
    <circle cx="12" cy="1.5" r="0.5" fill="currentColor" stroke="none" />
    
    {/* Water level indicator inside tank */}
    <rect x="9.8" y="6" width="4.4" height="2.5" rx="0.3" fill="#009dff" stroke="none" opacity="0.6" />
    <rect x="9.8" y="6" width="4.4" height="2.5" rx="0.3" fill="none" strokeWidth="0.8" opacity="0.5" />
    
    {/* Water waves inside tank */}
    <path d="M10 7C10.5 6.7 11.5 6.7 12 7C12.5 7.3 13.5 7.3 14 7" stroke="white" fill="none" strokeWidth="0.5" opacity="0.5" />
    <path d="M10 8C10.5 7.7 11.5 7.7 12 8C12.5 8.3 13.5 8.3 14 8" stroke="white" fill="none" strokeWidth="0.5" opacity="0.4" />
    
    {/* Outlet pipe */}
    <path d="M15 7L17 7L17 15L19 15" strokeWidth="1.2" />
    <circle cx="19" cy="15" r="0.8" fill="currentColor" stroke="none" />
    
    {/* Inlet pipe */}
    <path d="M9 6L7 6L7 10" strokeWidth="1" opacity="0.7" />
    
    {/* Ladder on tank */}
    <line x1="9.8" y1="9" x2="9.8" y2="5" strokeWidth="0.6" opacity="0.5" />
    <line x1="10.2" y1="9" x2="10.2" y2="5" strokeWidth="0.6" opacity="0.5" />
    <line x1="9.8" y1="6" x2="10.2" y2="6" strokeWidth="0.4" opacity="0.4" />
    <line x1="9.8" y1="7" x2="10.2" y2="7" strokeWidth="0.4" opacity="0.4" />
    <line x1="9.8" y1="8" x2="10.2" y2="8" strokeWidth="0.4" opacity="0.4" />
    
    {/* Overflow pipe */}
    <path d="M15 8L16.5 8L16.5 16" strokeWidth="0.8" opacity="0.6" strokeDasharray="1 1" />
    
    {/* Water drop dripping from overflow */}
    <path d="M16.5 16.5L16.5 17.5" stroke="#009dff" strokeWidth="0.8" opacity="0.7" />
    <path d="M16.3 17.5L16.5 18.5L16.7 17.5" fill="#009dff" stroke="none" opacity="0.7" />
    
    {/* Ground shadow */}
    <ellipse cx="12" cy="22" rx="6" ry="0.5" fill="currentColor" stroke="none" opacity="0.1" />
    
    {/* Splash effect at base */}
    <path d="M10 19C11 18.5 13 18.5 14 19" stroke="#009dff" fill="none" strokeWidth="0.5" opacity="0.4" />
  </svg>
)

export default WaterTowerIcon