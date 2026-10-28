// ============================================================
// src/components/RenderAwakeningModal.jsx
// Interactive UI explaining Render Free Tier Cold-Start for recruiters & visitors
// ============================================================
import { useState } from 'react';
import { 
  FaServer, 
  FaCheckCircle, 
  FaClock, 
  FaRocket, 
  FaRedo, 
  FaTimes, 
  FaMinus, 
  FaDatabase, 
  FaShieldAlt,
  FaExternalLinkAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { SiRender, SiSpringboot, SiReact, SiDocker } from 'react-icons/si';
import { useServerStatus } from '../context/ServerStatusContext';

export default function RenderAwakeningModal() {
  const {
    status,
    isWaking,
    isOnline,
    elapsedSeconds,
    latency,
    showModal,
    minimized,
    dismissModal,
    openModal,
    checkHealth,
  } = useServerStatus();

  const [copiedKey, setCopiedKey] = useState(null);

  // Calculate estimated progress percentage (0-95% over 50s, 100% when online)
  const progressPercent = isOnline 
    ? 100 
    : Math.min(94, Math.max(8, Math.round((elapsedSeconds / 50) * 94)));

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Floating pill when minimized and still waking up
  if (minimized && isWaking && !isOnline) {
    return (
      <div 
        onClick={openModal}
        className="fixed bottom-5 right-5 z-50 cursor-pointer animate-bounce-slow"
      >
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0c192c]/95 border border-orange-500/40 shadow-2xl backdrop-blur-md hover:border-orange-500 transition-all">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
          <div className="text-left">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <SiRender className="text-[#46e3b7]" /> Render Backend Waking Up...
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              Elapsed: <strong className="text-orange-400">{elapsedSeconds}s</strong> • Click to view progress
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#0c192c] to-[#060e18] border border-[#1c3554] shadow-2xl overflow-hidden text-slate-100"
        style={{
          boxShadow: isOnline 
            ? '0 0 50px -10px rgba(16, 185, 129, 0.3)' 
            : '0 0 50px -10px rgba(255, 102, 0, 0.25)'
        }}
      >
        {/* Glow Header Accent Bar */}
        <div 
          className={`h-1.5 w-full transition-colors duration-500 ${
            isOnline 
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600' 
              : 'bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-500'
          }`} 
        />

        {/* Top Controls Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-cyan-400">
              <SiRender className="text-base text-[#46e3b7]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Render Cloud Hosting Notice
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={dismissModal}
              title="Minimize to background"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs flex items-center gap-1"
            >
              <FaMinus className="text-[10px]" />
              <span className="text-[10px] hidden sm:inline">Minimize</span>
            </button>
            <button
              type="button"
              onClick={dismissModal}
              title="Close notification"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 pt-2 space-y-5">
          {/* Main Title Section */}
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span 
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  isOnline 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-orange-500 animate-ping'}`} />
                {isOnline ? 'System Fully Operational' : 'Spinning Up Render Container'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isOnline ? `Latency: ${latency}ms` : `Elapsed: ${elapsedSeconds}s (~50s)`}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white pt-1">
              {isOnline ? (
                <span className="text-emerald-400 flex items-center gap-2">
                  <FaCheckCircle className="text-xl" /> Backend is Online & Ready!
                </span>
              ) : (
                'Application Initializing on Render'
              )}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {isOnline ? (
                'All Java 21 Spring Boot services, JWT security, and TiDB Cloud database pools are synchronized and ready for testing.'
              ) : (
                <>
                  <strong className="text-cyan-300 font-semibold">Welcome Recruiters & Users!</strong> This project is deployed on <strong className="text-white">Render Free Tier</strong>. Free-tier backend containers automatically enter sleep mode after 15 minutes of inactivity. Initial spin-up takes approximately <span className="text-orange-400 font-bold">45 to 60 seconds</span>.
                </>
              )}
            </p>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="space-y-1.5 bg-[#060e18] p-4 rounded-2xl border border-[#1c3554]/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <FaClock className="text-orange-400 text-xs" />
                {isOnline ? 'Container Boot Sequence Complete' : 'Waking Container & Spring Boot JVM...'}
              </span>
              <span className="font-mono font-bold text-orange-400">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-[#1c3554]/60 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isOnline 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                    : 'bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-0.5">
              <span>0s (Request started)</span>
              <span>Estimated: ~45–60s</span>
              <span>100% Ready</span>
            </div>
          </div>

          {/* Architecture Deployment Steps Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0c192c]/70 border border-emerald-500/30 text-emerald-400">
              <FaCheckCircle className="text-sm flex-shrink-0" />
              <div className="text-left">
                <p className="font-bold text-[11px] text-white">Frontend UI Loaded</p>
                <p className="text-[9px] text-slate-400">React 18 + Vite (Global CDN)</p>
              </div>
            </div>

            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left ${
              isOnline 
                ? 'bg-[#0c192c]/70 border-emerald-500/30 text-emerald-400' 
                : 'bg-[#060e18] border-orange-500/30 text-orange-400'
            }`}>
              {isOnline ? (
                <FaCheckCircle className="text-sm flex-shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              <div>
                <p className="font-bold text-[11px] text-white">Spring Boot 3 + Java 21</p>
                <p className="text-[9px] text-slate-400">
                  {isOnline ? 'JVM Active on Render' : 'Cold-booting container...'}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left ${
              isOnline 
                ? 'bg-[#0c192c]/70 border-emerald-500/30 text-emerald-400' 
                : 'bg-[#060e18] border-[#1c3554] text-slate-400'
            }`}>
              {isOnline ? (
                <FaCheckCircle className="text-sm flex-shrink-0 text-emerald-400" />
              ) : (
                <FaDatabase className="text-sm flex-shrink-0 text-cyan-400" />
              )}
              <div>
                <p className="font-bold text-[11px] text-white">TiDB Cloud / MySQL</p>
                <p className="text-[9px] text-slate-400">
                  {isOnline ? 'HikariCP Pool Connected' : 'Establishing TLS link...'}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left ${
              isOnline 
                ? 'bg-[#0c192c]/70 border-emerald-500/30 text-emerald-400' 
                : 'bg-[#060e18] border-[#1c3554] text-slate-400'
            }`}>
              {isOnline ? (
                <FaCheckCircle className="text-sm flex-shrink-0 text-emerald-400" />
              ) : (
                <FaShieldAlt className="text-sm flex-shrink-0 text-slate-500" />
              )}
              <div>
                <p className="font-bold text-[11px] text-white">Security & REST APIs</p>
                <p className="text-[9px] text-slate-400">
                  {isOnline ? '256-bit JWT Endpoints Ready' : 'Awaiting container warmup'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Demo Credentials for Recruiters */}
          <div className="bg-[#060e18]/80 border border-[#1c3554]/60 rounded-2xl p-3.5 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <FaInfoCircle /> Recruiter Demo Credentials
              </span>
              <span className="text-[9px] text-slate-500">Click to copy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => copyToClipboard('admin / Admin@123', 'admin')}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0c192c] border border-[#1c3554] hover:border-orange-500/50 transition-all text-left"
              >
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Admin Portal</p>
                  <p className="font-mono text-[11px] text-slate-200">admin / Admin@123</p>
                </div>
                <span className="text-[9px] text-orange-400 font-semibold">
                  {copiedKey === 'admin' ? 'Copied!' : 'Copy'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard('rahul.sharma / Customer@123', 'customer')}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0c192c] border border-[#1c3554] hover:border-cyan-500/50 transition-all text-left"
              >
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Customer Portal</p>
                  <p className="font-mono text-[11px] text-slate-200">rahul.sharma / Customer@123</p>
                </div>
                <span className="text-[9px] text-cyan-400 font-semibold">
                  {copiedKey === 'customer' ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#1c3554]/40">
            <div className="text-[10px] text-slate-500 flex items-center gap-2">
              <SiDocker className="text-xs text-blue-400" />
              <SiSpringboot className="text-xs text-emerald-400" />
              <SiReact className="text-xs text-cyan-400" />
              <span>Full-Stack Architecture on Render Cloud</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={checkHealth}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#0c192c] border border-[#1c3554] hover:bg-[#13263e] text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <FaRedo className={`text-[10px] ${!isOnline ? 'animate-spin' : ''}`} />
                <span>Ping Server</span>
              </button>

              <button
                type="button"
                onClick={dismissModal}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
              >
                {isOnline ? 'Continue to App' : 'Explore UI in Background'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
