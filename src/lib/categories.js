const SITE_CATEGORY_LABELS = {
  travel: "Travel",
  tech: "Tech",
  finance: "Finance",
  products: "Lifestyle",
  sports: "Sports",
  trading: "Trading",
};

const NAV_FOOTER_CATEGORY_LABELS = {
  travel: "Travel & Adventure",
  tech: "Technology",
  finance: "Finance",
  products: "E-commerce",
  sports: "Sports",
  trading: "Trading & Investment",
};

export function formatCategoryLabel(value, context = "site") {
  if (!value) return "";
  const key = String(value).trim().toLowerCase();
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
