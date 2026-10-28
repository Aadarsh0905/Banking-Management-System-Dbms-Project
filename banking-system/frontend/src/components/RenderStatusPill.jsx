// ============================================================
// src/components/RenderStatusPill.jsx
// Compact status badge for Navbar & Auth pages with Architecture details
// ============================================================
import { useState } from 'react';
import { 
  FaServer, 
  FaCheckCircle, 
  FaClock, 
  FaDatabase, 
  FaExternalLinkAlt, 
  FaInfoCircle, 
  FaRedo, 
  FaTimes,
  FaShieldAlt
} from 'react-icons/fa';
import { SiRender, SiSpringboot, SiReact, SiDocker } from 'react-icons/si';
import { useServerStatus } from '../context/ServerStatusContext';

export default function RenderStatusPill({ compact = false }) {
  const {
    status,
    isWaking,
    isOnline,
    elapsedSeconds,
    latency,
    healthUrl,
    checkHealth,
    openModal,
  } = useServerStatus();

  const [detailsOpen, setDetailsOpen] = useState(false);

  const handlePillClick = () => {
    if (isWaking) {
      openModal();
    } else {
      setDetailsOpen(true);
    }
  };

  return (
    <>
      {/* Clickable Status Pill */}
      <button
        type="button"
        onClick={handlePillClick}
        title="View Render Cloud Deployment & System Architecture"
        className={`inline-flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer ${
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
        } ${
          isOnline
            ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400'
            : isWaking
            ? 'bg-orange-950/40 border border-orange-500/50 text-orange-300 hover:bg-orange-900/50 hover:border-orange-400 animate-pulse'
            : 'bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800'
        }`}
      >
        <span className="relative flex h-2 w-2">
          {isWaking && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isOnline
                ? 'bg-emerald-400'
                : isWaking
                ? 'bg-orange-500'
                : 'bg-slate-400'
            }`}
          ></span>
        </span>

        <span className="flex items-center gap-1.5 font-bold tracking-wide">
          <SiRender className="text-[#46e3b7] text-[11px]" />
          <span>
            {isOnline
              ? compact
                ? `Render: Online (${latency ? `${latency}ms` : '<300ms'})`
                : `Render Cloud: Online (${latency ? `${latency}ms` : '<300ms'})`
              : isWaking
              ? `Render Waking: ${elapsedSeconds}s ⚡`
              : 'Render Cloud: Checking...'}
          </span>
        </span>
      </button>

      {/* Architecture & Cloud Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0c192c] border border-[#1c3554] shadow-2xl p-6 text-slate-100 text-left space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1c3554]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#46e3b7]">
                  <SiRender className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">System & Cloud Architecture</h3>
                  <p className="text-[11px] text-slate-400">Render Free-Tier Hosting Specification</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Status Highlight */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${
              isOnline 
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                : 'bg-orange-950/30 border-orange-500/30 text-orange-300'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-orange-400 animate-ping'}`} />
                <span className="font-bold text-xs uppercase tracking-wider">
                  {isOnline ? 'Live Web Service Operational' : 'Container Boot in Progress'}
                </span>
              </div>
              <span className="font-mono text-xs">
                {isOnline ? `Ping: ${latency}ms` : `Elapsed: ${elapsedSeconds}s`}
              </span>
            </div>

            {/* Architecture Matrix */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#060e18] border border-[#1c3554]/60">
                <span className="text-[9px] uppercase tracking-wider font-bold text-cyan-400 flex items-center gap-1 mb-1">
                  <SiReact className="text-xs" /> Frontend Tier
                </span>
                <p className="font-bold text-slate-200">React 18 + Vite SPA</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Render Static Site (Global CDN)</p>
              </div>

              <div className="p-3 rounded-xl bg-[#060e18] border border-[#1c3554]/60">
                <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1 mb-1">
                  <SiSpringboot className="text-xs" /> Backend Tier
                </span>
                <p className="font-bold text-slate-200">Spring Boot 3 + Java 21</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Render Docker Web Service</p>
              </div>

              <div className="p-3 rounded-xl bg-[#060e18] border border-[#1c3554]/60">
                <span className="text-[9px] uppercase tracking-wider font-bold text-orange-400 flex items-center gap-1 mb-1">
                  <FaDatabase className="text-xs" /> Database Tier
                </span>
                <p className="font-bold text-slate-200">TiDB Cloud / MySQL 8</p>
                <p className="text-[10px] text-slate-400 mt-0.5">TLS / SSL Encrypted Pool</p>
              </div>

              <div className="p-3 rounded-xl bg-[#060e18] border border-[#1c3554]/60">
                <span className="text-[9px] uppercase tracking-wider font-bold text-purple-400 flex items-center gap-1 mb-1">
                  <FaShieldAlt className="text-xs" /> Authentication
                </span>
                <p className="font-bold text-slate-200">JWT Token + BCrypt</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Stateless Session Security</p>
              </div>
            </div>

            {/* Cold Start Notice Explanation */}
            <div className="p-3.5 rounded-2xl bg-[#060e18]/90 border border-[#1c3554]/50 text-xs space-y-1.5">
              <div className="font-bold text-orange-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <FaInfoCircle /> About Render Free-Tier Sleep Cycle:
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                To offer free hosting without cost, Render puts instances to sleep after <strong>15 minutes of zero inbound traffic</strong>. When someone opens the application, Render performs a cold container start which takes <strong>~45 to 60 seconds</strong>.
              </p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Once active, subsequent requests, transactions, and API responses run at sub-second speeds.
              </p>
            </div>

            {/* Health Endpoint URL & Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#1c3554]">
              <div className="truncate text-[10px] text-slate-500 font-mono">
                Endpoint: {healthUrl.replace(/^https?:\/\//, '')}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => checkHealth()}
                  className="px-3 py-1.5 rounded-xl bg-[#060e18] border border-[#1c3554] hover:bg-[#13263e] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <FaRedo className="text-[10px]" />
                  <span>Ping</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
