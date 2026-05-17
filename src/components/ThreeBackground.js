/**
 * CSS-only ambient background. Soft floating blobs, grain, subtle vignette.
 * Replaces the WebGL background to keep the experience compatible across browsers
 * while preserving the calming, premium feel.
 */
export default function ThreeBackground() {
  return (
    <div className="ambient-bg" data-testid="three-bg" aria-hidden="true">
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />
      <div className="blob blob-d" />
      <div className="ambient-grain" />
    </div>
  );
}
