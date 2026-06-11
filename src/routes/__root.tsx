import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dezzi — Discounted Summer Clothes for Kids, Men & Women" },
      { name: "description", content: "Dezzi offers discounted summer clothing for kids, men, and women. Shop sun-ready styles at unbeatable prices." },
      { name: "author", content: "Dezzi" },
      { property: "og:title", content: "Dezzi — Summer Style, Discounted" },
      { property: "og:description", content: "Discounted summer clothing for the whole family." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Dezzi" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Splash />
      <PromoBanner />
      <SiteHeader />
      <CategoryNav />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <SiteFooter />
    </QueryClientProvider>
  );
}

const PROMOS = [
  "Summer Sale — Up to 50% off everything",
  "New drop: Coastal Linen Collection",
  "Free shipping on orders over $40",
  "Kids' swimwear — buy 2, get 1 free",
  "Limited time: Extra 15% off with code SUNNY15",
  "Just in: Floral midi dresses from $29.99",
  "Father's Day picks now live",
];

function PromoBanner() {
  const items = [...PROMOS, ...PROMOS]; // duplicate for seamless loop
  return (
    <div className="dz-banner" aria-label="Promotional announcements">
      <div className="dz-marquee">
        {items.map((p, i) => (
          <span key={i}>{p}</span>
        ))}
      </div>
    </div>
  );
}

function SiteHeader() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <header className="dz-header">
      <div className="dz-header-inner">
        <Link to="/" className="dz-logo" aria-label="Dezzi home">
          Dez<span>zi</span>
        </Link>
        <form
          className="dz-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const term = q.trim();
            if (!term) return;
            navigate({ to: "/search", search: { q: term } });
          }}
        >
          <input
            type="search"
            placeholder="Search summer clothes, dresses, swim, kids..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit">Search</button>
        </form>
        <div style={{ fontSize: 13, color: "var(--dz-muted)" }}>
          Free shipping $40+
        </div>
      </div>
    </header>
  );
}

function CategoryNav() {
  return (
    <nav className="dz-nav" aria-label="Categories">
      <div className="dz-nav-inner">
        <Link to="/">Home</Link>
        <Link to="/category/$slug" params={{ slug: "female" }}>Women</Link>
        <Link to="/category/$slug" params={{ slug: "male" }}>Men</Link>
        <Link to="/category/$slug" params={{ slug: "kids" }}>Kids (6m–18y)</Link>
        <span style={{ marginLeft: "auto", color: "var(--dz-pink-light)", fontWeight: 700 }}>
          Summer Edit ✿
        </span>
      </div>
    </nav>
  );
}

function SiteFooter() {
  return (
    <footer className="dz-footer">
      <div className="dz-footer-inner">
        <div>
          <div className="dz-logo" style={{ color: "#fff" }}>Dez<span style={{ color: "var(--dz-pink)" }}>zi</span></div>
          <p style={{ fontSize: 14, opacity: 0.9, marginTop: 8, maxWidth: 320 }}>
            Discounted summer style for kids, men and women — shipped straight to your door.
          </p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/category/$slug" params={{ slug: "female" }}>Women</Link>
          <Link to="/category/$slug" params={{ slug: "male" }}>Men</Link>
          <Link to="/category/$slug" params={{ slug: "kids" }}>Kids</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="mailto:johndoe@dezzi.com">johndoe@dezzi.com</a>
          <a href="tel:+15551234567">+1 (555) 123-4567</a>
          <a href="tel:+15559876543">+1 (555) 987-6543</a>
        </div>
      </div>
      <div className="dz-footer-bottom">© {new Date().getFullYear()} Dezzi. All prices in USD.</div>
    </footer>
  );
}

function Splash() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionStorage.getItem("dz-visited")) {
      setShow(true);
      sessionStorage.setItem("dz-visited", "1");
      const t = setTimeout(() => setShow(false), 2200);
      return () => clearTimeout(t);
    }
  }, []);
  if (!show) return null;
  return (
    <div className="dz-splash" aria-hidden="true">
      <div className="dz-splash-name">Dez<span>zi</span></div>
    </div>
  );
}
