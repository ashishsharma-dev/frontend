import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { formatCategoryLabel } from "../lib/categories";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/category/travel", label: formatCategoryLabel("travel", "nav") },
  { to: "/category/tech", label: formatCategoryLabel("tech", "nav") },
  { to: "/category/finance", label: "Finance" },
  { to: "/category/products", label: formatCategoryLabel("products", "nav") },
  { to: "/category/sports", label: "Sports" },
  { to: "/category/trading", label: formatCategoryLabel("trading", "nav") },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass" data-testid="site-navbar">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="nav-home-logo">
          <span className="font-serif text-2xl tracking-tight text-forest-900">Githy</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {NAV.slice(0, 7).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                `transition-colors ${isActive ? "text-sage" : "text-forest-500 hover:text-forest-900"}`
              }
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block" />
      </div>
      <div className="lg:hidden border-t border-sand-300/60 overflow-x-auto">
        <div className="px-6 py-2 flex gap-5 text-xs whitespace-nowrap">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              className={({ isActive }) => (isActive ? "text-sage font-medium" : "text-forest-500")}
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}

export function EditorialRibbon() {
  const items = [
    "Calm reading", "Slow journalism", "Long-form essays", "Considered products",
    "Patient finance", "Quiet tech", "Editorial in calm rhythm", "Reader-first",
  ];

  return (
    <div className="bg-forest-900 text-sand-100 py-3 overflow-hidden" data-testid="editorial-ribbon">
      <div className="marquee-track text-xs uppercase tracking-[0.28em]">
        {[...items, ...items, ...items].map((s, i) => (
          <span key={i} className="opacity-80">{s} <span className="mx-6 opacity-40">&middot;</span></span>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  const readLinks = ["travel", "tech", "finance", "products", "sports", "trading"];

  return (
    <footer className="border-t border-sand-300 bg-sand-100 mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div className="font-serif text-2xl text-forest-900 mb-3">Githy</div>
          <p className="text-sm text-forest-500 leading-relaxed">
            Calm, considered writing on travel, tech, finance, lifestyle, sports and trading. Trends worth slowing down for.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-4">Read</div>
          <ul className="space-y-2 text-sm">
            {readLinks.map((slug) => (
              <li key={slug}>
                <Link to={`/category/${slug}`} className="text-forest-700 hover:text-sage">
                  {formatCategoryLabel(slug, "nav")}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">Site</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-forest-700 hover:text-sage">About</Link></li>
            <li><Link to="/contact" className="text-forest-700 hover:text-sage">Contact</Link></li>
            <li><Link to="/privacy-policy" className="text-forest-700 hover:text-sage">Privacy Policy</Link></li>
            <li><Link to="/affiliate-disclosure" className="text-forest-700 hover:text-sage">Affiliate Disclosure</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">News Letter</div>
          <p className="text-sm text-forest-500 mb-3">One thoughtful email per week. No noise.</p>
          <NewsletterSmall />
        </div>
      </div>
      <div className="border-t border-sand-300 py-6 text-center text-xs text-forest-500">
        &copy; Githy. Trends worth slowing down for.
      </div>
    </footer>
  );
}

function NewsletterSmall() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const email = e.currentTarget.email.value.trim();
        if (!email) return;
        setBusy(true);
        try {
          const { api, formatApiError } = await import("../lib/api");
          const { data } = await api.post("/newsletter", { email });
          e.currentTarget.reset();
          setMessage(data?.message || "Subscribed.");
        } catch (err) {
          setMessage("");
          (await import("sonner")).toast.error(formatApiError(err));
        } finally {
          setBusy(false);
        }
      }}
      data-testid="footer-newsletter-form"
    >
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          disabled={busy}
          placeholder="you@quiet.email"
          className="flex-1 bg-white border border-sand-300 px-3 py-2 text-sm focus:outline-none focus:border-sage"
          data-testid="footer-newsletter-email"
        />
        <button className="btn-primary text-xs py-2 px-3" data-testid="footer-newsletter-submit" disabled={busy}>
          {busy ? "..." : "Join"}
        </button>
      </div>
      {message && <p className="text-xs text-sage">{message}</p>}
    </form>
  );
}
