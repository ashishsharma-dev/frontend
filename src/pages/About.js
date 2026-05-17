export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-20" data-testid="about-page">
      <div className="eyebrow mb-4">Our Editorial Vision</div>
      <h1 className="font-serif text-5xl md:text-6xl text-forest-900 leading-tight">A quiet desk for thoughtful readers.</h1>
      <div className="article-body mt-10">
        <p className="lead">
          Global Trend Hub began with a simple frustration: the modern internet rewards speed and noise, and we wanted a quieter place to think and connect.
        </p>
        <p>
          We publish long-form essays across six sections — Travel, Tech, Finance, Products, Sports, and Trading — written for readers who'd rather think than scroll. Every essay is reviewed at least twice before publication. We refuse engagement-bait formats. We don't chase trending stories.
        </p>
        <h2>Our Editorial Standards</h2>
        <p>
          When we recommend a product, we've used it. When we cover a destination, we've been there. When we discuss money, we tell you what we'd actually do with our own. Sponsorships, when they appear, are clearly marked, and we never accept payment in exchange for coverage angle.
        </p>
        <h2>For Advertising Partners</h2>
        <p>
          Our readership is intentionally narrow: thoughtful, US-based readers who treat reading as part of a calmer media diet. If your brand fits that audience, we'd love to talk. We offer a small, curated set of premium ad placements designed to feel editorial rather than intrusive — banner, sidebar, in-content, and sponsored long reads.
        </p>
        <p>
          Get in touch via the <a href="/contact" className="text-sage hover:underline">contact page</a>. We typically reply within two days.
        </p>
        <h2>The Team</h2>
        <p>
          Global Trend Hub is a small team of contributors based across the United States. We work asynchronously, slowly, and (mostly) without notifications.
        </p>
      </div>
    </div>
  );
}
