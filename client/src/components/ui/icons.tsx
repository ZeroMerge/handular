import React from 'react';

export type IconProps = React.SVGProps<SVGSVGElement>;

// Search / Magnifying Glass - Heroicons 24 Solid
export const MagnifyingGlassIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
  </svg>
);

// Shield Check / Verified - Heroicons 24 Solid
export const ShieldCheckIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

// Check Circle / Success - Heroicons 24 Solid
export const CheckCircleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
  </svg>
);

// Checkmark - Heroicons 24 Solid
export const CheckIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
  </svg>
);

// Exclamation Triangle / Alert - Heroicons 24 Solid
export const ExclamationTriangleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
  </svg>
);

// Exclamation Circle - Heroicons 24 Solid
export const ExclamationCircleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
  </svg>
);

// Computer / Laptop - Heroicons 24 Solid
export const ComputerDesktopIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M2.25 4.5A.75.75 0 0 1 3 3.75h18a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-8.25v2.25h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.25H3a.75.75 0 0 1-.75-.75V4.5Z" clipRule="evenodd" />
  </svg>
);

// Mobile Phone - Heroicons 24 Solid (Square-balanced)
export const DevicePhoneMobileIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M7.5 3a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h9a2.25 2.25 0 0 0 2.25-2.25V5.25A2.25 2.25 0 0 0 16.5 3h-9Zm3.75 14.25a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" clipRule="evenodd" />
  </svg>
);

// Phone Handset - Heroicons 24 Solid (Square-balanced)
export const PhoneIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
  </svg>
);

// Sparkles / Gear / Accessories - Heroicons 24 Solid
export const SparklesIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path d="M12 2.25a.75.75 0 0 1 .75.75c0 2.441.97 4.707 2.707 6.444A9.878 9.878 0 0 0 21.9 12.15a.75.75 0 0 1 0 1.5 9.878 9.878 0 0 0-6.443 2.706A9.878 9.878 0 0 0 12.75 22.8a.75.75 0 0 1-1.5 0 9.878 9.878 0 0 0-2.707-6.444A9.878 9.878 0 0 0 2.1 13.65a.75.75 0 0 1 0-1.5 9.878 9.878 0 0 0 6.444-2.706A9.878 9.878 0 0 0 11.25 3a.75.75 0 0 1 .75-.75Z" />
  </svg>
);

// User / Account - Heroicons 24 Solid
export const UserIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
  </svg>
);

// Envelope / Email - Heroicons 24 Solid
export const EnvelopeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
  </svg>
);

// Lock / Security - Heroicons 24 Solid
export const LockClosedIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
  </svg>
);

// Eye / Visible - Heroicons 24 Solid
export const EyeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
  </svg>
);

// Eye Slash / Hidden - Heroicons 24 Solid
export const EyeSlashIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
    <path d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c1.077 0 2.115.152 3.102.434l-1.92 1.92a7.228 7.228 0 0 0-1.182-.104 5.25 5.25 0 0 0-5.25 5.25c0 .41.036.809.104 1.182l-1.92 1.92a11.217 11.217 0 0 1-.934-2.839 1.762 1.762 0 0 1 0-1.113Z" />
  </svg>
);

// Arrow Right - Heroicons 24 Solid
export const ArrowRightIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

// Arrow Path / Refresh - Modern Balanced Dual-Arc Refresh
export const ArrowPathIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 4v5h5" />
    <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 5v-5h-5" />
  </svg>
);

// X Mark / Close - Heroicons 24 Solid
export const XMarkIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

// Bars 3 / Menu - Heroicons 24 Solid
export const Bars3Icon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
  </svg>
);

// Sign Out / Exit - Heroicons 24 Solid
export const ArrowRightOnRectangleIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9a.75.75 0 0 1-1.5 0V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

// Map Pin - Heroicons 24 Solid
export const MapPinIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
  </svg>
);

// Clock / Time - Heroicons 24 Solid
export const ClockIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
  </svg>
);

// Campus / University Library - Heroicons 24 Solid
export const BuildingLibraryIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M3.75 3a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75H4.5v13.5h-.75a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h16.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75H19.5V5h.75a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75H3.75ZM6 5h2.25v13.5H6V5Zm3.75 0h2.25v13.5H9.75V5Zm3.75 0h2.25v13.5H13.5V5Zm3.75 0H18v13.5h-.75V5Z" clipRule="evenodd" />
  </svg>
);

// Chat / WhatsApp - Heroicons 24 Solid
export const ChatBubbleOvalLeftEllipsisIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 3.694-9.75 8.25 0 2.457 1.139 4.67 2.946 6.182l-.993 3.475a.75.75 0 0 0 .937.915l3.968-1.488a10.82 10.82 0 0 0 2.892.416c5.385 0 9.75-3.694 9.75-8.25S17.385 2.25 12 2.25ZM8.25 11.25a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Zm4.875-1.125a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0Zm3.75 1.125a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" clipRule="evenodd" />
  </svg>
);

// Dashboard / Command Center - Heroicons 24 Solid
export const Squares2X2Icon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M3 3.75A.75.75 0 0 1 3.75 3h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-6A.75.75 0 0 1 3 9.75v-6Zm10.5 0a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1-.75-.75v-6ZM3 14.25a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1-.75-.75v-6Zm10.5 0a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-6a.75.75 0 0 1-.75-.75v-6Z" clipRule="evenodd" />
  </svg>
);

// Clipboard Document Check - Heroicons 24 Solid
export const ClipboardDocumentCheckIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M12 1.5a2.25 2.25 0 0 0-2.122 1.5H8.25A2.25 2.25 0 0 0 6 5.25v14.25A2.25 2.25 0 0 0 8.25 21.75h7.5A2.25 2.25 0 0 0 18 19.5V5.25A2.25 2.25 0 0 0 15.75 3h-1.628A2.25 2.25 0 0 0 12 1.5Zm0 1.5a.75.75 0 0 1 .75.75v.75H11.25V3.75A.75.75 0 0 1 12 3Zm3.53 7.28a.75.75 0 0 0-1.06-1.06L11 12.69l-1.47-1.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l4-4Z" clipRule="evenodd" />
  </svg>
);

// User Group / Vendors - Heroicons 24 Solid
export const UserGroupIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.633 13.067 13.067 0 0 1-6.761 1.87 13.067 13.067 0 0 1-6.76-1.87.75.75 0 0 1-.364-.633l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.605.75.75 0 0 0 .349-.627 6.75 6.75 0 0 0-5.175-6.526Z" />
  </svg>
);

// Banknotes / Currency - Heroicons 24 Solid
export const BanknotesIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
    <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM5.25 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75H5.25Z" clipRule="evenodd" />
  </svg>
);

// Plus / Add - Heroicons 24 Solid
export const PlusIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" />
  </svg>
);

// Home - Heroicons 24 Solid
export const HomeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
    <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
  </svg>
);

// Arrow Top Right On Square / External Link - Heroicons 24 Solid
export const ArrowTopRightOnSquareIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Zm-10.5 4.5a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z" clipRule="evenodd" />
  </svg>
);

// List Bullet / Sourcing Board - Heroicons 24 Solid
export const ListBulletIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 17.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
  </svg>
);

// Trash / Delete - Heroicons 24 Solid
export const TrashIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.5v.18a55.295 55.295 0 0 0-6 0V4.5c0-.816.61-1.45 1.364-1.474ZM9.75 9.75a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75Zm4.5 0a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0v-6.75a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);

// Sidebar Toggle / Bars 3 Bottom Left - Heroicons 24 Solid
export const Bars3BottomLeftIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
  </svg>
);

// WhatsApp Double Check (Delivered)
export const CheckCheckIcon: React.FC<IconProps> = ({ className = 'w-4 h-4', ...props }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>
    <path d="M18 6 7 17l-5-5" />
    <path d="m22 10-7.5 7.5L13 16" />
  </svg>
);

// Chevron Right - Heroicons 20 Solid
export const ChevronRightIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

// Chevron Down - Heroicons 20 Solid
export const ChevronDownIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', ...props }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true" {...props}>
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

