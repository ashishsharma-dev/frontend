import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Articles" },
  { to: "/category/travel", label: "Travel" },
  { to: "/category/tech", label: "Tech" },
  { to: "/category/finance", label: "Finance" },
  { to: "/category/products", label: "Products" },
  { to: "/category/sports", label: "Sports" },
  { to: "/category/trading", label: "Trading" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 glass" data-testid="site-navbar">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="nav-home-logo">
          <span className="font-serif text-2xl tracking-tight text-forest-900">Global Trend Hub</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {NAV.slice(0, 8).map(item => (
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
        <div className="flex items-center gap-3">
          {user && user.role === "admin" ? (
            <>
              <button
                onClick={() => navigate("/admin")}
                className="hidden md:inline-block text-sm text-forest-700 hover:text-sage transition-colors"
                data-testid="nav-admin-dashboard"
              >Dashboard</button>
              <button
                onClick={async () => { await logout(); navigate("/"); }}
                className="btn-ghost text-sm py-2 px-4"
                data-testid="nav-logout"
              >Sign out</button>
            </>
          ) : (
            <Link to="/admin/login" className="btn-ghost text-sm py-2 px-4" data-testid="nav-login">
              Editor
            </Link>
          )}
        </div>
      </div>
      <div className="lg:hidden border-t border-sand-300/60 overflow-x-auto">
        <div className="px-6 py-2 flex gap-5 text-xs whitespace-nowrap">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              className={({ isActive }) => isActive ? "text-sage font-medium" : "text-forest-500"}
              end={item.to === "/"}
            >{item.label}</NavLink>
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
          <span key={i} className="opacity-80">{s} <span className="mx-6 opacity-40">·</span></span>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-sand-300 bg-sand-100 mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div className="font-serif text-2xl text-forest-900 mb-3">Global Trend Hub</div>
          <p className="text-sm text-forest-500 leading-relaxed">
            Calm, considered writing on travel, tech, finance, products, sports and trading. Trends worth slowing down for.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-4">Read</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/blog" className="text-forest-700 hover:text-sage" data-testid="footer-articles">All Articles</Link></li>
            <li><Link to="/category/travel" className="text-forest-700 hover:text-sage">Travel</Link></li>
            <li><Link to="/category/tech" className="text-forest-700 hover:text-sage">Tech</Link></li>
            <li><Link to="/category/finance" className="text-forest-700 hover:text-sage">Finance</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">Site</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-forest-700 hover:text-sage">About</Link></li>
            <li><Link to="/contact" className="text-forest-700 hover:text-sage">Contact</Link></li>
            <li><Link to="/contact" className="text-forest-700 hover:text-sage">Advertise</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">Quiet Mailings</div>
          <p className="text-sm text-forest-500 mb-3">One thoughtful email per week. No noise.</p>
          <NewsletterSmall />
        </div>
      </div>
      <div className="border-t border-sand-300 py-6 text-center text-xs text-forest-500">
        © Global Trend Hub. Trends worth slowing down for.
      </div>
    </footer>
  );
}

function NewsletterSmall() {
  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const email = e.currentTarget.email.value.trim();
        if (!email) return;
        try {
          await (await import("../lib/api")).api.post("/newsletter", { email });
          e.currentTarget.reset();
          (await import("sonner")).toast.success("Subscribed — see you in your inbox.");
        } catch (err) {
          (await import("sonner")).toast.error("Could not subscribe. Try again.");
        }
      }}
      data-testid="footer-newsletter-form"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="you@quiet.email"
        className="flex-1 bg-white border border-sand-300 px-3 py-2 text-sm focus:outline-none focus:border-sage"
        data-testid="footer-newsletter-email"
      />
      <button className="btn-primary text-xs py-2 px-3" data-testid="footer-newsletter-submit">Join</button>
    </form>
  );
}
