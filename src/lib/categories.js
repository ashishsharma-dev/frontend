const SITE_CATEGORY_LABELS = {
  "travel-adventure": "Travel & Adventure",
  technology: "Technology",
  finance: "Finance",
  ecommerce: "Ecommerce",
  sports: "Sports",
  "trading-investment": "Trading & Investment",
};

const NAV_FOOTER_CATEGORY_LABELS = {
  "travel-adventure": "Travel & Adventure",
  technology: "Technology",
  finance: "Finance",
  ecommerce: "Ecommerce",
  sports: "Sports",
  "trading-investment": "Trading & Investment",
};

export function formatCategoryLabel(value, context = "site") {
  if (!value) return "";
  const raw = String(value).trim().toLowerCase();
  const key = raw === "products"
    ? "ecommerce"
    : raw === "travel"
      ? "travel-adventure"
      : raw === "tech"
        ? "technology"
        : raw === "trading"
          ? "trading-investment"
        : raw;
  const labels = context === "nav" ? NAV_FOOTER_CATEGORY_LABELS : SITE_CATEGORY_LABELS;
  return labels[key] || value;
}

export function formatCategoryMeta(category) {
  if (!category) return category;
  return {
    ...category,
    name: formatCategoryLabel(category.slug || category.name),
  };
}
