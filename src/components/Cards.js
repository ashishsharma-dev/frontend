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

const HARDCODED_ADS = {
  "travel-adventure": {
    image_url: "https://i.ibb.co/JwS24z03/githy-ad-4967130419594fb1a346c3551b0d4764-png.png",
  },
  technology: {
    image_url: "https://i.ibb.co/SDcDVMWj/githy-ad-5aeeb8380cb5424f9891329d532434da-png.png",
  },
  finance: {
    image_url: "https://i.ibb.co/Hp1rz6zR/githy-ad-6327abdafd264b499d679ea29034eec8-png.png",
  },
  ecommerce: {
    image_url: "https://i.ibb.co/Q71twWtG/githy-ad-119c09a7f4b94f9bac1493c5feec966d-png.png",
  },
  sports: {
    image_url: "https://i.ibb.co/Qvj22VZF/githy-ad-7bb6332dcef2453db5a0f16e12b41ad2-png.png",
  },
  "trading-investment": {
    image_url: "https://i.ibb.co/svHzNvZs/githy-ad-0864ed2d37714ad8b31e43d22abfcb6e-png.png",
  },
};

const FALLBACK_AD = {
  image_url: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27728%27%20height%3D%2790%27%20viewBox%3D%270%200%20728%2090%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27g%27%20x1%3D%270%25%27%20y1%3D%270%25%27%20x2%3D%27100%25%27%20y2%3D%270%25%27%3E%3Cstop%20offset%3D%270%25%27%20stop-color%3D%27%23f7f1e6%27/%3E%3Cstop%20offset%3D%27100%25%27%20stop-color%3D%27%23ece2d4%27/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20fill%3D%27url(%23g)%27%20rx%3D%278%27%20ry%3D%278%27/%3E%3Crect%20x%3D%2712%27%20y%3D%2712%27%20width%3D%27704%27%20height%3D%2766%27%20fill%3D%27none%27%20stroke%3D%27%23839788%27%20stroke-width%3D%271.5%27%20stroke-dasharray%3D%277%205%27%20rx%3D%276%27%20ry%3D%276%27/%3E%3Ctext%20x%3D%2728%27%20y%3D%2738%27%20fill%3D%27%232f4f4f%27%20font-size%3D%2715%27%20font-family%3D%27Georgia%2C%20serif%27%3EPlaceholder%20Advertisement%3C/text%3E%3Ctext%20x%3D%2728%27%20y%3D%2761%27%20fill%3D%27%235c6b6d%27%20font-size%3D%2712%27%20font-family%3D%27Arial%2C%20sans-serif%27%3ESponsored%20placement%20is%20currently%20unavailable%3C/text%3E%3C/svg%3E",
  hyperlink: null,
  is_dummy: true,
};

function normalizeAdCategory(category) {
  const raw = String(category || "").trim().toLowerCase();
  if (raw === "travel") return "travel-adventure";
  if (raw === "tech") return "technology";
  if (raw === "products") return "ecommerce";
  if (raw === "trading") return "trading-investment";
  return raw;
}

function getHardcodedAd(category) {
  const key = normalizeAdCategory(category);
  const creative = HARDCODED_ADS[key] || HARDCODED_ADS["trading-investment"];
  return creative ? { ...creative, hyperlink: null, is_dummy: false } : FALLBACK_AD;
}

export function AdSlot({ category = "", label = "Sponsored placement" }) {
  const [ad, setAd] = useState(() => getHardcodedAd(category));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const q = category ? `?category=${encodeURIComponent(category)}` : "";
    const hardcodedAd = getHardcodedAd(category);

    setAd(hardcodedAd);
    setLoading(true);

    api.get(`/ads/placement${q}`)
      .then(({ data }) => {
        if (mounted) {
          const nextAd = data?.image_url && !data?.is_dummy ? data : hardcodedAd;
          setAd(nextAd);
        }
      })
      .catch(() => {
        if (mounted) setAd(hardcodedAd);
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
