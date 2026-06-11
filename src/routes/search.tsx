import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { listProducts } from "@/lib/products.functions";
import { ProductCard } from "./index";

const searchSchema = z.object({ q: z.string().optional().default("") });

const searchQuery = (q: string) =>
  queryOptions({
    queryKey: ["products", "search", q],
    queryFn: () => (q ? listProducts({ data: { search: q } }) : Promise.resolve([])),
  });

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ q: search.q ?? "" }),
  loader: ({ context, deps }) =>
    deps.q ? context.queryClient.ensureQueryData(searchQuery(deps.q)) : Promise.resolve([]),
  head: ({ match }) => {
    const q = (match.search as { q?: string })?.q ?? "";
    return {
      meta: [
        { title: q ? `Search: ${q} — Dezzi` : "Search — Dezzi" },
        { name: "description", content: "Search Dezzi's summer clothing catalog." },
      ],
    };
  },
  component: SearchPage,
  errorComponent: ({ error }) => <div className="dz-main"><p className="dz-empty">{error.message}</p></div>,
  notFoundComponent: () => <div className="dz-main"><p className="dz-empty">Not found.</p></div>,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const term = q ?? "";
  const { data } = useSuspenseQuery(searchQuery(term));
  return (
    <main className="dz-main">
      <Link to="/" className="dz-back">← Home</Link>
      <h2 className="dz-section-title" style={{ marginTop: 12 }}>
        {term ? `Results for "${term}"` : "Search"}
      </h2>
      {!term ? (
        <p className="dz-empty">Type something in the search bar above to find products.</p>
      ) : data.length === 0 ? (
        <p className="dz-empty">No products matched "{term}". Try another keyword.</p>
      ) : (
        <div className="dz-grid">
          {data.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </main>
  );
}