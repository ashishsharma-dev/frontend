import { Link } from "react-router-dom";

export function PostCard({ post, large = false }) {
  return (
    <Link
      to={`/post/${post.slug}`}
      className="editorial-card group flex flex-col h-full overflow-hidden"
      data-testid={`post-card-${post.slug}`}
    >
      <div className={`overflow-hidden ${large ? "aspect-[16/10]" : "aspect-[4/3]"} bg-sand-200`}>
        <img
          src={post.cover_image}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className={`flex flex-col flex-1 p-6 ${large ? "md:p-8" : ""}`}>
        <div className="eyebrow mb-3 capitalize">{post.category}</div>
        <h3 className={`font-serif text-forest-900 group-hover:text-terracotta-dark transition-colors ${large ? "text-3xl md:text-4xl" : "text-xl md:text-[1.4rem]"} leading-tight`}>
          {post.title}
        </h3>
        <p className={`text-forest-500 mt-3 ${large ? "text-base" : "text-sm"} leading-relaxed line-clamp-3`}>
          {post.excerpt}
        </p>
        <div className="flex items-center gap-3 mt-auto pt-5 text-xs text-forest-500">
          <span className="truncate">{post.author}</span>
          <span className="opacity-50">·</span>
          <span className="whitespace-nowrap">{post.read_time || 6} min read</span>
        </div>
      </div>
    </Link>
  );
}

export function CategoryBadge({ category }) {
  return <span className="eyebrow" data-testid={`badge-${category}`}>{category}</span>;
}

export function AdSlot({ size = "banner", label = "Sponsored placement" }) {
  const heights = { banner: "h-28 md:h-32", square: "h-72", in: "h-40", side: "h-96" };
  return (
    <div className={`ad-slot ${heights[size]} flex items-center justify-center px-6`} data-testid={`ad-slot-${size}`}>
      <div className="text-center">
        <div className="font-serif text-forest-900 text-xl">Premium ad space</div>
        <div className="text-xs text-forest-500 mt-1">{label} · advertise@globaltrendhub.com</div>
      </div>
    </div>
  );
}
