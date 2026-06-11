import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { getProduct } from "@/lib/products.functions";

const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: () => getProduct({ data: { id } }),
  });

export const Route = createFileRoute("/product/$id")({
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p ? `${p.name} — Dezzi` : "Product — Dezzi";
    return {
      meta: [
        { title },
        { name: "description", content: p?.description.slice(0, 155) ?? "Shop discounted summer clothes at Dezzi." },
        { property: "og:title", content: title },
        { property: "og:description", content: p?.description.slice(0, 155) ?? "" },
        ...(p ? [{ property: "og:image", content: p.image_url }] : []),
      ],
    };
  },
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(productQuery(params.id));
    if (!result) throw notFound();
    return result;
  },
  component: ProductPage,
  errorComponent: ({ error }) => <div className="dz-main"><p className="dz-empty">{error.message}</p></div>,
  notFoundComponent: () => (
    <div className="dz-main">
      <p className="dz-empty">Product not found.</p>
      <Link to="/" className="dz-back">← Back home</Link>
    </div>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(id));
  const [size, setSize] = useState<string | null>(null);
  if (!data) return null;
  const { product, reviews } = data;
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;
  const catLabel = product.category === "female" ? "Women" : product.category === "male" ? "Men" : "Kids";

  return (
    <main className="dz-main">
      <Link to="/category/$slug" params={{ slug: product.category }} className="dz-back">
        ← Back to {catLabel}
      </Link>

      <div className="dz-pd">
        <div className="dz-pd-img">
          <img src={product.image_url} alt={product.name} />
        </div>
        <div>
          <span className="dz-pd-cat">{catLabel}</span>
          <h1>{product.name}</h1>
          <div className="dz-pd-rating">
            <span className="stars">
              {"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}
            </span>
            {product.rating.toFixed(1)} ({product.review_count} reviews)
          </div>
          <div className="dz-pd-price">
            ${product.price.toFixed(2)}
            {product.original_price && (
              <span className="old">${Number(product.original_price).toFixed(2)}</span>
            )}
            {discount > 0 && (
              <span style={{ marginLeft: 12, fontSize: 14, color: "var(--dz-teal-dark)", fontWeight: 700 }}>
                Save {discount}%
              </span>
            )}
          </div>

          <p className="dz-pd-desc">{product.description}</p>

          {product.sizes.length > 0 && (
            <div className="dz-pd-sizes">
              <h4>Size {size && <span style={{ color: "var(--dz-pink-dark)" }}>· {size}</span>}</h4>
              <div className="dz-size-list">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={"dz-size" + (size === s ? " selected" : "")}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <a
            className="dz-buy"
            href={product.amazon_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy on Amazon →
          </a>
          <p style={{ fontSize: 12, color: "var(--dz-muted)", marginTop: 10 }}>
            Purchase is fulfilled by Amazon. Opens in a new tab.
          </p>
        </div>
      </div>

      <section className="dz-reviews">
        <h2 className="dz-section-title">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="dz-no-reviews">No reviews yet. Be the first to share what you think.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="dz-review">
              <div className="dz-review-head">
                <span className="dz-review-author">{r.author}</span>
                <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
              </div>
              <h4>{r.title}</h4>
              <p>{r.body}</p>
            </div>
          ))
        )}
      </section>
    </main>
  );
}