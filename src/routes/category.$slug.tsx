import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listProducts } from "@/lib/products.functions";
import { ProductCard } from "./index";

const LABELS: Record<string, string> = {
  female: "Women",
  male: "Men",
  kids: "Kids (6 months – 18 years)",
};

const catQuery = (slug: "kids" | "male" | "female") =>
  queryOptions({
    queryKey: ["products", "category", slug],
    queryFn: () => listProducts({ data: { category: slug } }),
  });

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const label = LABELS[params.slug] ?? "Shop";
    return {
      meta: [
        { title: `${label} — Dezzi` },
        { name: "description", content: `Shop discounted ${label.toLowerCase()} summer clothes at Dezzi.` },
        { property: "og:title", content: `${label} — Dezzi` },
        { property: "og:description", content: `Shop discounted ${label.toLowerCase()} summer clothes at Dezzi.` },
      ],
    };
  },
  loader: ({ context, params }) => {
    if (!["female", "male", "kids"].includes(params.slug)) throw notFound();
    return context.queryClient.ensureQueryData(catQuery(params.slug as "female"));
  },
  component: CategoryPage,
  errorComponent: ({ error }) => <div className="dz-main"><p className="dz-empty">{error.message}</p></div>,
  notFoundComponent: () => (
    <div className="dz-main">
      <p className="dz-empty">Category not found.</p>
      <Link to="/" className="dz-back">← Back home</Link>
    </div>
  ),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(catQuery(slug as "female"));
  return (
    <main className="dz-main">
      <Link to="/" className="dz-back">← Home</Link>
      <h2 className="dz-section-title" style={{ marginTop: 12 }}>{LABELS[slug]}</h2>
      {data.length === 0 ? (
        <p className="dz-empty">No products in this category yet.</p>
      ) : (
        <div className="dz-grid">
          {data.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </main>
  );
}