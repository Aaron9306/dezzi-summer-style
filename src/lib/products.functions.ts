import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type Product = {
  id: string;
  name: string;
  description: string;
  category: "kids" | "male" | "female";
  price: number;
  original_price: number | null;
  image_url: string;
  amazon_url: string;
  rating: number;
  review_count: number;
  sizes: string[];
  featured: boolean;
};

export type Review = {
  id: string;
  product_id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
};

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        category: z.enum(["kids", "male", "female"]).optional(),
        search: z.string().optional(),
        featuredOnly: z.boolean().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });
    if (data.category) q = q.eq("category", data.category);
    if (data.featuredOnly) q = q.eq("featured", true);
    if (data.search && data.search.trim()) {
      // Split into words; escape PostgREST .or() reserved chars (, ( ) and %)
      const words = data.search
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.replace(/[%,()*]/g, ""));
      for (const w of words) {
        const t = `%${w}%`;
        q = q.or(`name.ilike.${t},description.ilike.${t},category.ilike.${t}`);
      }
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as Product[];
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!product) return null;
    const { data: reviews } = await supabaseAdmin
      .from("product_reviews")
      .select("*")
      .eq("product_id", data.id)
      .order("created_at", { ascending: false });
    return { product: product as Product, reviews: (reviews ?? []) as Review[] };
  });