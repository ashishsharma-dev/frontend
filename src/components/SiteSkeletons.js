import { Skeleton } from "./ui/skeleton";

export function PostCardSkeleton() {
  return (
    <div className="editorial-card flex flex-col h-full overflow-hidden bg-white">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-6">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="mt-4 h-8 w-full" />
        <Skeleton className="mt-2 h-8 w-5/6" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function AdSkeleton({ className = "" }) {
  return (
    <div className={`flex justify-center ${className}`}>
      <Skeleton className="h-[90px] w-full max-w-[728px]" />
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div data-testid="home-skeleton">
      <section className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-16">
        <div className="max-w-4xl">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="mt-6 h-16 w-full max-w-3xl" />
          <Skeleton className="mt-3 h-16 w-4/5 max-w-2xl" />
          <Skeleton className="mt-7 h-5 w-full max-w-2xl" />
          <Skeleton className="mt-3 h-5 w-3/4 max-w-xl" />
          <div className="mt-9 flex gap-3">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-12">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 overflow-hidden bg-white border border-sand-300">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="p-8 md:p-10">
              <Skeleton className="h-3 w-32 rounded-full" />
              <Skeleton className="mt-5 h-10 w-full" />
              <Skeleton className="mt-3 h-10 w-4/5" />
              <Skeleton className="mt-5 h-5 w-full" />
              <Skeleton className="mt-2 h-5 w-5/6" />
            </div>
          </div>
          <div className="lg:col-span-4 grid grid-cols-1 gap-6 lg:gap-8">
            {Array.from({ length: 3 }).map((_, index) => <PostCardSkeleton key={index} />)}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 my-10">
        <AdSkeleton />
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="mt-4 h-12 w-80 max-w-full" />
          </div>
          <Skeleton className="hidden md:block h-4 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="editorial-card p-7 min-h-[180px]">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="mt-4 h-8 w-full" />
              <Skeleton className="mt-3 h-8 w-4/5" />
              <Skeleton className="mt-8 h-4 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="mt-4 h-12 w-72 max-w-full" />
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, index) => <PostCardSkeleton key={index} />)}
        </div>
        <div className="my-12">
          <AdSkeleton />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {Array.from({ length: 3 }).map((_, index) => <PostCardSkeleton key={index} />)}
        </div>
      </section>
    </div>
  );
}

export function BlogListSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="blog-list-skeleton">
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className="mt-5 h-14 w-72 max-w-full" />
      <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
      <div className="mt-10 mb-8">
        <Skeleton className="h-12 w-full md:max-w-md" />
      </div>
      <div className="my-8">
        <AdSkeleton />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {Array.from({ length: 9 }).map((_, index) => <PostCardSkeleton key={index} />)}
      </div>
      <div className="my-12">
        <AdSkeleton />
      </div>
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <article data-testid="post-detail-skeleton">
      <section className="max-w-4xl mx-auto px-6 lg:px-10 pt-16 pb-10 text-center">
        <div className="flex justify-center">
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-6 h-12 w-full" />
        <Skeleton className="mt-3 h-12 w-5/6 mx-auto" />
        <div className="mt-6 flex justify-center gap-3">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <Skeleton className="w-full h-[380px] md:h-[560px] rounded-none" />
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-16">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="mt-3 h-5 w-11/12" />
        <Skeleton className="mt-3 h-5 w-full" />
        <Skeleton className="mt-3 h-5 w-4/5" />
        <Skeleton className="mt-8 h-9 w-52" />
        <Skeleton className="mt-5 h-5 w-full" />
        <Skeleton className="mt-3 h-5 w-10/12" />
        <div className="my-12">
          <AdSkeleton />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="mt-3 h-5 w-full" />
        <Skeleton className="mt-3 h-5 w-4/5" />

        <div className="mt-16 pt-10 border-t border-sand-300">
          <Skeleton className="h-3 w-28 rounded-full" />
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-11 w-28" />
            <Skeleton className="h-11 w-28" />
            <Skeleton className="h-11 w-28" />
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-sand-300">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="mt-5 h-10 w-48" />
          <div className="mt-6 bg-white border border-sand-300 p-6">
            <div className="grid md:grid-cols-2 gap-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="mt-3 h-28 w-full" />
            <Skeleton className="mt-4 h-11 w-32" />
          </div>
        </div>
      </div>
    </article>
  );
}
