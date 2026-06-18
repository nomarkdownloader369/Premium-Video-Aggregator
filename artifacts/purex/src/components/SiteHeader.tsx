import { Link, useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { Search, Upload, User, Shield, LogOut, Flame, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { apiFetch, type SearchSuggestion } from "@/lib/api";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pathname, navigate] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const sugRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (sugRef.current) clearTimeout(sugRef.current);
    if (q.length < 2) { setSuggestions([]); return; }
    sugRef.current = setTimeout(async () => {
      try {
        const data = await apiFetch<SearchSuggestion[]>(`/search/suggest?q=${encodeURIComponent(q)}`);
        setSuggestions(data);
        setShowSug(true);
      } catch {}
    }, 220);
    return () => { if (sugRef.current) clearTimeout(sugRef.current); };
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSug(false);
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/trending", label: "Trending" },
    { to: "/categories", label: "Categories" },
  ];

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-white/5" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="container-px mx-auto flex h-16 max-w-[1600px] items-center gap-4 md:gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent shadow-glow">
            <div className="absolute inset-[3px] rounded-md bg-background grid place-items-center">
              <span className="text-[10px] font-black text-gradient-red">PX</span>
            </div>
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight">
            Pure<span className="text-gradient-red">X</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navItems.map((n) => {
            const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
            return (
              <Link key={n.to} to={n.to}>
                <span className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  active ? "text-foreground bg-white/5" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <form onSubmit={submit} className="flex-1 max-w-xl ml-auto relative" onBlur={() => setTimeout(() => setShowSug(false), 150)}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setShowSug(true); }}
              onFocus={() => q.length >= 2 && setShowSug(true)}
              placeholder="Search titles, performers, tags…"
              className="w-full h-10 pl-9 pr-3 rounded-full bg-white/5 border border-white/10 placeholder:text-muted-foreground/70 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-white/10 transition"
            />
          </div>
          <AnimatePresence>
            {showSug && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-12 left-0 right-0 glass rounded-2xl overflow-hidden shadow-elev z-50"
              >
                {suggestions.map((s, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => { setQ(s.value); setShowSug(false); navigate(`/search?q=${encodeURIComponent(s.value)}`); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 flex items-center gap-3"
                    >
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium capitalize">{s.type}</span>
                      {s.value}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </form>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/submit">
                <span className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold shadow-glow hover:scale-[1.02] transition cursor-pointer">
                  <Upload className="h-4 w-4" /> Submit
                </span>
              </Link>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="h-9 w-9 grid place-items-center rounded-full bg-gradient-to-br from-primary/60 to-accent/60 text-white text-sm font-bold"
                >
                  {(user.email?.[0] ?? "U").toUpperCase()}
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="absolute right-0 top-11 w-52 glass rounded-2xl overflow-hidden shadow-elev z-50 border border-white/10"
                    >
                      <div className="px-4 py-3 border-b border-white/5 text-xs text-muted-foreground truncate">{user.email}</div>
                      <div className="py-1">
                        {isAdmin && (
                          <Link to="/admin">
                            <span onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 cursor-pointer text-gold">
                              <Shield className="h-4 w-4" /> Admin Panel
                            </span>
                          </Link>
                        )}
                        <Link to="/dashboard">
                          <span onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 cursor-pointer">
                            <User className="h-4 w-4" /> Dashboard
                          </span>
                        </Link>
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); navigate("/"); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 text-muted-foreground"
                        >
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/auth">
              <span className="h-9 px-4 grid place-items-center rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 cursor-pointer transition">
                Sign in
              </span>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden ml-auto" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden glass border-t border-white/5 overflow-hidden"
          >
            <nav className="container-px py-4 flex flex-col gap-1">
              {navItems.map((n) => (
                <Link key={n.to} to={n.to}>
                  <span onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-white/5 cursor-pointer">{n.label}</span>
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/submit"><span onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-accent cursor-pointer"><Flame className="inline h-4 w-4 mr-1" /> Submit Video</span></Link>
                  {isAdmin && <Link to="/admin"><span onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-gold cursor-pointer"><Shield className="inline h-4 w-4 mr-1" /> Admin</span></Link>}
                  <button onClick={() => { logout(); setMobileOpen(false); navigate("/"); }} className="text-left px-3 py-2 rounded-lg text-sm text-muted-foreground">Sign out</button>
                </>
              ) : (
                <Link to="/auth"><span onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-semibold text-primary cursor-pointer">Sign in</span></Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
