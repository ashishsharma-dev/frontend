import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, resolveMediaUrl } from "../lib/api";
import { formatCategoryLabel } from "../lib/categories";
import { AdSkeleton } from "./SiteSkeletons";

export function PostCard({ post, large = false }) {
  return (
    <Link
      to={`/post/${post.slug}`}
      className="editorial-card group flex flex-col h-full overflow-hidden"
      data-testid={`post-card-${post.slug}`}
    >
      <div className={`overflow-hidden ${large ? "aspect-[16/10]" : "aspect-[4/3]"} bg-sand-200`}>
        <FallbackImage
          src={post.cover_image}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          placeholderClassName="w-full h-full"
        />
      </div>
      <div className={`flex flex-col flex-1 p-6 ${large ? "md:p-8" : ""}`}>
        <div className="eyebrow mb-3 capitalize">{formatCategoryLabel(post.category)}</div>
        <h3 className={`font-serif text-forest-900 group-hover:text-terracotta-dark transition-colors ${large ? "text-3xl md:text-4xl" : "text-xl md:text-[1.4rem]"} leading-tight`}>
          {post.title}
        </h3>
        <p className={`text-forest-500 mt-3 ${large ? "text-base" : "text-sm"} leading-relaxed line-clamp-3`}>
          {post.excerpt}
        </p>
        <div className="flex items-center gap-3 mt-auto pt-5 text-xs text-forest-500">
          <span className="truncate">{post.author}</span>
          <span className="opacity-50">&middot;</span>
          <span className="whitespace-nowrap">{post.read_time || 6} min read</span>
        </div>
      </div>
    </Link>
  );
}

function FallbackImage({ src, alt, className = "", placeholderClassName = "", ...props }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`${placeholderClassName} bg-gradient-to-br from-sand-100 to-sand-300 flex items-center justify-center`} aria-hidden="true">
        <span className="text-[0.65rem] uppercase tracking-[0.25em] text-forest-500">No Cover</span>
      </div>
    );
  }

  return <img src={resolveMediaUrl(src)} alt={alt} onError={() => setFailed(true)} className={className} {...props} />;
}

export function CategoryBadge({ category }) {
  return <span className="eyebrow" data-testid={`badge-${category}`}>{formatCategoryLabel(category)}</span>;
}

const FALLBACK_AD = {
  image_url: "",
  hyperlink: null,
  is_dummy: true,
};

export function AdSlot({ category = "", label = "Sponsored placement" }) {
  const [ad, setAd] = useState(FALLBACK_AD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const q = category ? `?category=${encodeURIComponent(category)}` : "";
    setLoading(true);

    api.get(`/ads/placement${q}`)
      .then(({ data }) => {
        if (mounted) setAd(data || FALLBACK_AD);
      })
      .catch(() => {
        if (mounted) setAd(FALLBACK_AD);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [category]);

  const image = (
    <img
      src={resolveMediaUrl(ad.image_url)}
      alt={label}
      className="block w-full max-w-[728px] h-auto border border-sand-300 bg-sand-100"
    />
  );

  if (loading) {
    return <AdSkeleton className="w-full" />;
  }

  return (
    <div className="flex justify-center" data-testid={`ad-slot-${category || "global"}`}>
      <div className="w-full max-w-[728px]">
        {ad.hyperlink && !ad.is_dummy ? (
          <a href={ad.hyperlink} target="_blank" rel="noreferrer sponsored" aria-label={label} className="block">
            {image}
          </a>
        ) : image}
      </div>
    </div>
  );
}
