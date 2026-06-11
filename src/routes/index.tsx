import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listProducts, type Product } from "@/lib/products.functions";

const featuredQuery = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: () => listProducts({ data: { featuredOnly: true } }),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dezzi — Discounted Summer Clothes" },
      { name: "description", content: "Summer-ready clothing for kids, men and women at discount prices. Shop dresses, swim, linen and more on Dezzi." },
      { property: "og:title", content: "Dezzi — Discounted Summer Clothes" },
      { property: "og:description", content: "Summer-ready clothing for kids, men and women at discount prices." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(featuredQuery),
  component: Index,
  errorComponent: ({ error }) => <div className="dz-main"><p className="dz-empty">Couldn't load products: {error.message}</p></div>,
  notFoundComponent: () => <div className="dz-main"><p className="dz-empty">Not found.</p></div>,
});

function Index() {
  const { data: featured } = useSuspenseQuery(featuredQuery);
  return (
    <main className="dz-main">
      <section className="dz-hero">
        <h1>Dez<span>zi</span></h1>
        <p>Summer style for the whole family — up to 50% off, every day.</p>
        <Link to="/category/$slug" params={{ slug: "female" }} className="dz-hero-cta">
          Shop the Summer Edit
        </Link>
      </section>

      <h2 className="dz-section-title">Shop by Category</h2>
      <div className="dz-cat-grid">
        <Link to="/category/$slug" params={{ slug: "female" }} className="dz-cat-card">
          <h3>Women</h3><p>Dresses, tanks, denim & swim</p>
        </Link>
        <Link to="/category/$slug" params={{ slug: "male" }} className="dz-cat-card">
          <h3>Men</h3><p>Linen, shorts, polos & swim</p>
        </Link>
        <Link to="/category/$slug" params={{ slug: "kids" }} className="dz-cat-card">
          <h3>Kids</h3><p>6 months to 18 years</p>
        </Link>
      </div>

      <h2 className="dz-section-title">Featured Deals</h2>
      {featured.length === 0 ? (
        <p className="dz-empty">No featured products yet.</p>
      ) : (
        <div className="dz-grid">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </main>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;
  return (
    <Link to="/product/$id" params={{ id: product.id }} className="dz-card">
      <div className="dz-card-img">
        {discount > 0 && <span className="dz-badge">-{discount}%</span>}
        <img src={product.image_url} alt={product.name} loading="lazy" />
      </div>
      <div className="dz-card-body">
        <p className="dz-card-name">{product.name}</p>
        <div className="dz-card-rating">
          <span className="stars">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}</span>
          {" "}({product.review_count})
        </div>
        <div>
          <span className="dz-price">${product.price.toFixed(2)}</span>
          {product.original_price && (
            <span className="dz-price-old">${Number(product.original_price).toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
