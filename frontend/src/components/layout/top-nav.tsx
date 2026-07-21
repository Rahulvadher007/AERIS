"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Radio, Activity, CloudRain, Car, TrendingUp, 
  Map, AlertTriangle, Lightbulb, Settings, 
  ChevronDown, Clock, Menu, X, ShieldAlert,
  BarChart3, MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCity } from "@/contexts/city-context";

const PRIMARY_ROUTES = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stations", label: "Stations", icon: Radio },
  { href: "/aqi", label: "Analytics", icon: Activity },
  { href: "/weather", label: "Weather", icon: CloudRain },
  { href: "/traffic", label: "Traffic", icon: Car },
  { href: "/forecast", label: "Forecast", icon: TrendingUp },
];

const SECONDARY_ROUTES = [
  { href: "/heatmap", label: "Heatmap", icon: Map, description: "Geospatial air quality visualization." },
  { href: "/hotspots", label: "Hotspots", icon: AlertTriangle, description: "View detected pollution clusters." },
  { href: "/recommendations", label: "Recommendations", icon: Lightbulb, description: "AI-generated advisory actions." },
  { href: "/interventions", label: "Interventions", icon: ShieldAlert, description: "AI-generated intervention plans." },
  { href: "/evidence", label: "Evidence", icon: BarChart3, description: "Judging proof: RMSE, confidence, response time." },
  { href: "/advisories", label: "Advisories", icon: MessageSquare, description: "Multilingual citizen health advisories." },
  { href: "/settings", label: "Settings", icon: Settings, description: "Platform configuration." },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [time, setTime] = useState<Date | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  const { selectedCity, setSelectedCity, availableCities } = useCity();

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  const isMoreActive = SECONDARY_ROUTES.some(route => pathname.startsWith(route.href));

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex h-[80px] w-[95%] items-center justify-between px-4 sm:px-6 rounded-[20px]"
      style={{
        backgroundColor: "rgba(10, 10, 12, 0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Left: Logo */}
      <Link href="/" className="flex items-center shrink-0 mr-4 group">
        <div className="relative h-12 w-32 md:h-14 md:w-36 transition-transform duration-500 group-hover:scale-[1.02]">
          <Image
            src="/assets/logo/aeris-logo.png"
            alt="AERIS - Air Environmental Response & Intelligence System"
            fill
            sizes="(max-width: 768px) 128px, 144px"
            className="object-contain object-left"
            priority
          />
        </div>
      </Link>

      {/* Center: Scrollable Navigation Pills */}
      <nav 
        className="hidden lg:flex flex-1 items-center justify-center"
        onMouseLeave={() => setHoveredPath(null)}
      >
        <div className="flex items-center gap-1.5">
          {PRIMARY_ROUTES.map((route) => {
            const Icon = route.icon;
            const isActive = pathname.startsWith(route.href);
            const isHovered = hoveredPath === route.href;
            
            return (
              <Link
                key={route.href}
                href={route.href}
                onMouseEnter={() => setHoveredPath(route.href)}
                className="relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors outline-none"
                style={{
                  color: isActive ? "#00D084" : isHovered ? "white" : "#A1A1AA",
                  transform: isHovered && !isActive ? "scale(1.02)" : "scale(1)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-full bg-[#00D084]/10 border border-[#00D084]/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className="absolute inset-x-4 -bottom-[1px] h-[1px] bg-gradient-to-r from-transparent via-[#00D084] to-transparent shadow-[0_0_10px_#00D084]" />
                  </motion.div>
                )}
                
                {/* Hover Glass Effect */}
                {!isActive && isHovered && (
                  <motion.div
                    layoutId="hoverNav"
                    className="absolute inset-0 rounded-full bg-white/5 border border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                
                <Icon className={cn(
                  "relative z-10 h-[18px] w-[18px] transition-transform duration-300", 
                  isHovered && !isActive && "scale-110",
                  isActive && "filter drop-shadow-[0_0_4px_rgba(0,208,132,0.5)]"
                )} />
                <span className="relative z-10 whitespace-nowrap tracking-wide">{route.label}</span>
              </Link>
            );
          })}

          {/* MORE Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsMoreDropdownOpen(true)}
            onMouseLeave={() => setIsMoreDropdownOpen(false)}
          >
            <button
              onMouseEnter={() => setHoveredPath('more')}
              className="relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors outline-none"
              style={{
                color: isMoreActive ? "#00D084" : hoveredPath === 'more' ? "white" : "#A1A1AA",
                transform: hoveredPath === 'more' && !isMoreActive ? "scale(1.02)" : "scale(1)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              suppressHydrationWarning
            >
              {/* Active Indicator Glow */}
              {isMoreActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-full bg-[#00D084]/10 border border-[#00D084]/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <div className="absolute inset-x-4 -bottom-[1px] h-[1px] bg-gradient-to-r from-transparent via-[#00D084] to-transparent shadow-[0_0_10px_#00D084]" />
                </motion.div>
              )}
              
              {/* Hover Glass Effect */}
              {!isMoreActive && hoveredPath === 'more' && (
                <motion.div
                  layoutId="hoverNav"
                  className="absolute inset-0 rounded-full bg-white/5 border border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <span className="relative z-10 whitespace-nowrap tracking-wide">More</span>
              <ChevronDown className={cn("relative z-10 h-4 w-4 transition-transform duration-300", isMoreDropdownOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isMoreDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[260px] rounded-[20px] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                  style={{
                    backgroundColor: "rgba(10, 10, 12, 0.85)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div className="flex flex-col gap-1">
                    {SECONDARY_ROUTES.map((route) => {
                      const Icon = route.icon;
                      const isActive = pathname.startsWith(route.href);
                      return (
                        <Link
                          key={route.href}
                          href={route.href}
                          className={cn(
                            "group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
                            isActive ? "bg-[#00D084]/10 border border-[#00D084]/20" : "hover:bg-white/5 border border-transparent hover:border-white/10"
                          )}
                        >
                          <div className={cn(
                            "mt-0.5 flex shrink-0 items-center justify-center rounded-lg p-2 transition-colors",
                            isActive ? "bg-[#00D084]/20" : "bg-white/5 group-hover:bg-[#00D084]/20"
                          )}>
                            <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-[#00D084]" : "text-zinc-400 group-hover:text-[#00D084]")} />
                          </div>
                          <div className="flex flex-col">
                            <span className={cn("text-sm font-semibold transition-colors", isActive ? "text-[#00D084]" : "text-zinc-200 group-hover:text-white")}>
                              {route.label}
                            </span>
                            <span className="text-[11px] font-medium text-zinc-500 leading-tight mt-0.5">
                              {route.description}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 shrink-0 ml-auto">
        {/* City Selector */}
        <div className="relative hidden md:block">
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="appearance-none rounded-full border border-white/10 bg-[#111111]/80 pl-10 pr-10 py-2.5 text-sm font-bold text-white outline-none focus:border-[#00D084]/40 transition-all cursor-pointer hover:bg-white/5 hover:border-white/20 shadow-inner"
            suppressHydrationWarning
          >
            {availableCities.map((c) => (
              <option key={c} value={c} className="bg-[#09090B] text-white">{c}</option>
            ))}
          </select>
          <Map className="absolute left-3.5 top-2.5 h-[18px] w-[18px] text-[#00D084]" />
          <ChevronDown className="absolute right-3.5 top-3 h-[18px] w-[18px] text-zinc-400 pointer-events-none" />
        </div>

        {/* Clock */}
        <div className="hidden xl:flex items-center gap-2.5 rounded-full border border-white/10 bg-[#111111]/80 px-4 py-2.5 text-sm font-bold text-zinc-200 hover:border-white/20 transition-all cursor-default">
          <Clock className="h-[18px] w-[18px] text-zinc-400" />
          <span className="tracking-wider">{time ? format(time, "HH:mm:ss") : "00:00:00"}</span>
        </div>



        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 lg:hidden rounded-full bg-[#111111]/80 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/10"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu (Responsive Dropdown) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-[90px] left-0 right-0 bg-[#09090B]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 z-50 space-y-1.5 lg:hidden max-h-[85vh] overflow-y-auto shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            {[...PRIMARY_ROUTES, ...SECONDARY_ROUTES].map((route) => {
              const Icon = route.icon;
              const isActive = pathname.startsWith(route.href);
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-bold transition-all ${
                    isActive 
                      ? "bg-[#00D084]/10 text-[#00D084] border border-[#00D084]/20" 
                      : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-[#00D084]" : "text-zinc-500")} />
                  {route.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
