const { createClient } = require("@supabase/supabase-js");

function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: String(product.name || "").trim(),
    brand: String(product.brand || product.store || "").trim(),
    store: String(product.store || product.brand || "").trim(),
    category: String(product.category || "").trim(),
    description: String(product.description || "").trim(),
    image: String(product.image || "").trim(),
    link: String(product.link || "").trim(),
    sortOrder: Number(product.sortOrder ?? product.sort_order) || 0,
    createdAt: product.createdAt || product.created_at || null,
  };
}

function mapProductToRow(product) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    store: product.store,
    category: product.category,
    description: product.description,
    image: product.image,
    link: product.link,
    sort_order: Number(product.sortOrder) || 0,
  };
}

function createFallbackProducts(products) {
  return products
    .map(normalizeProduct)
    .filter(Boolean)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));
}

function sortProducts(products) {
  return [...products].sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));
}

function createShopStore({ fallbackProducts, supabaseUrl, supabaseServiceRoleKey, tableName = "app_shop_products" }) {
  let fallbackCatalog = createFallbackProducts(fallbackProducts || []);
  const hasSupabaseConfig = Boolean(supabaseUrl && supabaseServiceRoleKey);
  let activeSource = hasSupabaseConfig ? "supabase" : "fallback";

  if (!hasSupabaseConfig) {
    return {
      mode: "fallback",
      isSupabaseEnabled: false,
      async listProducts() {
        activeSource = "fallback";
        return sortProducts(fallbackCatalog);
      },
      async createProduct(product) {
        const normalized = normalizeProduct({
          ...product,
          id: product.id || (fallbackCatalog.at(-1)?.id || 0) + 1,
        });
        fallbackCatalog = sortProducts([...fallbackCatalog, normalized]);
        activeSource = "fallback";
        return normalized;
      },
      async updateProduct(productId, updates) {
        const normalizedId = Number(productId);
        const currentProduct = fallbackCatalog.find((entry) => Number(entry.id) === normalizedId);

        if (!currentProduct) {
          return null;
        }

        const nextProduct = normalizeProduct({
          ...currentProduct,
          ...updates,
          id: normalizedId,
        });

        fallbackCatalog = sortProducts(
          fallbackCatalog.map((entry) => (Number(entry.id) === normalizedId ? nextProduct : entry))
        );
        activeSource = "fallback";
        return nextProduct;
      },
      async deleteProduct(productId) {
        const normalizedId = Number(productId);
        const exists = fallbackCatalog.some((entry) => Number(entry.id) === normalizedId);

        if (!exists) {
          return false;
        }

        fallbackCatalog = fallbackCatalog.filter((entry) => Number(entry.id) !== normalizedId);
        activeSource = "fallback";
        return true;
      },
      getDiagnostics() {
        return {
          configuredMode: "fallback",
          activeSource,
          tableName: null,
          fallbackCount: fallbackCatalog.length,
        };
      },
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    mode: "supabase",
    isSupabaseEnabled: true,
    async listProducts() {
      try {
        const { data, error } = await supabase.from(tableName).select("*").order("sort_order", { ascending: true }).order("name", { ascending: true });

        if (error) {
          throw error;
        }

        const normalized = (data || []).map(normalizeProduct).filter(Boolean);

        if (normalized.length > 0) {
          activeSource = "supabase";
          return normalized;
        }
      } catch (error) {
        console.warn(`Shop catalog fallback engaged: ${error.message}`);
      }

      activeSource = "fallback";
      return sortProducts(fallbackCatalog);
    },
    async createProduct(product) {
      const { data: latestRow, error: latestError } = await supabase
        .from(tableName)
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestError) {
        throw latestError;
      }

      const nextProduct = normalizeProduct({
        ...product,
        id: product.id || (Number(latestRow?.id) || 0) + 1,
      });

      const { data, error } = await supabase.from(tableName).insert(mapProductToRow(nextProduct)).select("*").single();

      if (error) {
        throw error;
      }

      activeSource = "supabase";
      return normalizeProduct(data);
    },
    async updateProduct(productId, updates) {
      const normalizedId = Number(productId);
      const nextProduct = normalizeProduct({
        ...updates,
        id: normalizedId,
      });

      const { data, error } = await supabase
        .from(tableName)
        .update(mapProductToRow(nextProduct))
        .eq("id", normalizedId)
        .select("*")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      activeSource = "supabase";
      return normalizeProduct(data);
    },
    async deleteProduct(productId) {
      const normalizedId = Number(productId);
      const { error, count } = await supabase.from(tableName).delete({ count: "exact" }).eq("id", normalizedId);

      if (error) {
        throw error;
      }

      activeSource = "supabase";
      return Boolean(count);
    },
    async seedFallbackProducts() {
      if (fallbackCatalog.length === 0) {
        return { imported: 0 };
      }

      const { error } = await supabase.from(tableName).upsert(fallbackCatalog.map(mapProductToRow), { onConflict: "id" });

      if (error) {
        throw error;
      }

      activeSource = "supabase";
      return { imported: fallbackCatalog.length };
    },
    getDiagnostics() {
      return {
        configuredMode: "supabase",
        activeSource,
        tableName,
        fallbackCount: fallbackCatalog.length,
      };
    },
  };
}

module.exports = {
  createShopStore,
};