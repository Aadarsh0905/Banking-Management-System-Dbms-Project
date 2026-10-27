import React from 'react';

// ── 1. PhonePe Official Logo ────────────────────────────────
export function PhonePeLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-[#5f259f] p-1.5 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="#5F259F" />
        {/* Devanagari "पे" Glyph */}
        <path
          d="M27.5 13H17.5C16.67 13 16 13.67 16 14.5V17H21V33.5C21 34.33 21.67 35 22.5 35H25.5C26.33 35 27 34.33 27 33.5V25H29.5C33.64 25 37 21.64 37 17.5C37 15.01 34.99 13 32.5 13H27.5ZM27 20H24V17H27C27.83 17 28.5 17.67 28.5 18.5C28.5 19.33 27.83 20 27 20Z"
          fill="white"
        />
        <path
          d="M21 13L28 6H33L26 13H21Z"
          fill="white"
        />
      </svg>
    </div>
  );
}

// ── 2. Google Pay Official Logo ─────────────────────────────
export function GooglePayLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-white p-1 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#FFFFFF" />
        {/* GPay 4-Color Geometric Capsule Logo */}
        <path
          d="M20.2 18.5C18.8 17.1 16.5 17.1 15.1 18.5L9.5 24.1C8.1 25.5 8.1 27.8 9.5 29.2L11.8 31.5C13.2 32.9 15.5 32.9 16.9 31.5L22.5 25.9C23.9 24.5 23.9 22.2 22.5 20.8L20.2 18.5Z"
          fill="#4285F4"
        />
        <path
          d="M32.9 18.5L25.2 26.2C23.8 27.6 23.8 29.9 25.2 31.3L27.5 33.6C28.9 35 31.2 35 32.6 33.6L40.3 25.9C41.7 24.5 41.7 22.2 40.3 20.8L38 18.5C36.6 17.1 34.3 17.1 32.9 18.5Z"
          fill="#34A853"
        />
        <path
          d="M32.9 18.5C34.3 17.1 36.6 17.1 38 18.5L40.3 20.8C41.7 22.2 41.7 24.5 40.3 25.9L34.7 31.5L27.1 23.9L32.9 18.5Z"
          fill="#FBBC04"
        />
        <path
          d="M20.2 18.5L25.9 24.2L20.2 29.9L15.1 24.8C13.7 23.4 13.7 21.1 15.1 19.7L17.9 16.9C18.6 17.5 19.5 18 20.2 18.5Z"
          fill="#EA4335"
        />
      </svg>
    </div>
  );
}

// ── 3. Paytm Official Logo ──────────────────────────────────
export function PaytmLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-white p-1 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 60 28" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="28" rx="6" fill="#FFFFFF" />
        {/* Dark Blue "Pay" */}
        <text x="3" y="20" fontFamily="sans-serif" fontSize="18" fontWeight="900" fill="#002E6E">Pay</text>
        {/* Cyan "tm" */}
        <text x="34" y="20" fontFamily="sans-serif" fontSize="18" fontWeight="900" fill="#00BAF2">tm</text>
      </svg>
    </div>
  );
}

// ── 4. UPI (Unified Payments Interface / BHIM) ──────────────
export function UpiLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-white p-1 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 54 28" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="54" height="28" rx="6" fill="#FFFFFF" />
        {/* Dual Chevron */}
        <path d="M14 6L6 22H13L21 6H14Z" fill="#71A83E" />
        <path d="M22 6L14 22H21L29 6H22Z" fill="#F37021" />
        {/* UPI text */}
        <text x="31" y="20" fontFamily="sans-serif" fontSize="14" fontWeight="900" fill="#2E3192" fontStyle="italic">UPI</text>
      </svg>
    </div>
  );
}

// ── 5. State Bank of India (SBI) ────────────────────────────
export function SbiLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-[#0082c6] p-1 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#0082C6" />
        <circle cx="20" cy="18" r="7.5" fill="#FFFFFF" />
        <circle cx="20" cy="18" r="3.2" fill="#0082C6" />
        <rect x="18.2" y="18" width="3.6" height="15" fill="#0082C6" />
      </svg>
    </div>
  );
}

// ── 6. HDFC Bank ────────────────────────────────────────────
export function HdfcLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-white p-1 shadow-sm overflow-hidden flex-shrink-0 border border-slate-200 ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#FFFFFF" />
        <rect x="5" y="5" width="30" height="30" fill="#004C8F" />
        {/* Red cross elements */}
        <rect x="5" y="17" width="30" height="6" fill="#ED232A" />
        <rect x="17" y="5" width="6" height="30" fill="#ED232A" />
        <rect x="15" y="15" width="10" height="10" fill="#004C8F" />
        <rect x="17.5" y="17.5" width="5" height="5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

// ── 7. ICICI Bank ───────────────────────────────────────────
export function IciciLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-[#b02a30] p-1 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#B02A30" />
        <circle cx="20" cy="20" r="14" fill="#F37021" />
        {/* Stylized 'i' symbol */}
        <circle cx="20" cy="12" r="2.8" fill="#FFFFFF" />
        <path d="M17.5 17H22.5V27C22.5 29 20 29.5 17.5 29.5V27C18.8 27 19.5 26.5 19.5 25.5V17H17.5Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

// ── 8. Axis Bank ────────────────────────────────────────────
export function AxisLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-[#97144d] p-1 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#97144D" />
        {/* Axis geometric triangle emblem */}
        <path d="M20 7L33 31H25.5L20 19L14.5 31H7L20 7Z" fill="#FFFFFF" />
        <path d="M20 19L24.5 28H15.5L20 19Z" fill="#97144D" />
      </svg>
    </div>
  );
}

// ── 9. Kotak Mahindra Bank ──────────────────────────────────
export function KotakLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-[#ed1b24] p-1 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#ED1B24" />
        {/* White infinity graphic */}
        <path
          d="M13.5 15C10.5 15 8 17.2 8 20C8 22.8 10.5 25 13.5 25C16.8 25 19.2 21.5 20 20C19.2 18.5 16.8 15 13.5 15ZM26.5 15C23.2 15 20.8 18.5 20 20C20.8 21.5 23.2 25 26.5 25C29.5 25 32 22.8 32 20C32 17.2 29.5 15 26.5 15Z"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

// ── 10. Punjab National Bank (PNB) ──────────────────────────
export function PnbLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-[#a20032] p-1 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#A20032" />
        <circle cx="20" cy="20" r="14" fill="#FDB813" />
        <circle cx="20" cy="20" r="10" fill="#A20032" />
        <circle cx="20" cy="20" r="5" fill="#FDB813" />
      </svg>
    </div>
  );
}

// ── 11. Stripe Global Payments ──────────────────────────────
export function StripeLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-xl bg-[#635bff] p-1.5 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#635BFF" />
        <path
          d="M26.2 18.8C25.9 17.3 24.5 16.5 22.2 16.5C19.3 16.5 17.5 17.9 17.5 20.1C17.5 23.4 22.3 22.9 22.3 24.7C22.3 25.5 21.4 25.9 20.3 25.9C18.6 25.9 16.9 25 16.3 24.3L15.3 26.6C16.3 27.5 18.3 28.1 20.3 28.1C23.6 28.1 25.4 26.6 25.4 24.3C25.4 20.9 20.6 21.6 20.6 19.8C20.6 19.2 21.3 18.7 22.2 18.7C23.6 18.7 25 19.3 25.6 19.8L26.2 18.8Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
}

// ── 12. Visa Card ───────────────────────────────────────────
export function VisaLogo({ className = 'w-7 h-5' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-md bg-[#1a1f71] p-1 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 48 16" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <text x="3" y="14" fontFamily="sans-serif" fontSize="16" fontWeight="900" fontStyle="italic" fill="#F7B600">V</text>
        <text x="16" y="14" fontFamily="sans-serif" fontSize="16" fontWeight="900" fontStyle="italic" fill="#FFFFFF">ISA</text>
      </svg>
    </div>
  );
}

// ── 13. MasterCard ──────────────────────────────────────────
export function MastercardLogo({ className = 'w-7 h-5' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-md bg-[#1f2430] p-1 shadow-sm overflow-hidden flex-shrink-0 ${className}`}>
      <svg viewBox="0 0 36 22" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="13" cy="11" r="9" fill="#EB001B" />
        <circle cx="23" cy="11" r="9" fill="#F79E1B" fillOpacity="0.9" />
      </svg>
    </div>
  );
}

// ── 14. RuPay Card ──────────────────────────────────────────
export function RupayLogo({ className = 'w-7 h-5' }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-md bg-white p-1 shadow-sm overflow-hidden flex-shrink-0 border border-slate-200 ${className}`}>
      <svg viewBox="0 0 44 16" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L8 13H12L7 3H3Z" fill="#00884D" />
        <path d="M9 3L14 13H18L13 3H9Z" fill="#F37021" />
        <text x="18" y="12" fontFamily="sans-serif" fontSize="10" fontWeight="900" fill="#00549F">RuPay</text>
      </svg>
    </div>
  );
}
