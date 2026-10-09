import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight, Pause, Play, Flower2, Scissors, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import wardrobe from "@/assets/wardrobe.asset.json";
import festive from "@/assets/festive.asset.json";
import wardrobeWebm from "@/assets/wardrobe-webm.asset.json";
import festiveWebm from "@/assets/festive-webm.asset.json";
import dress from "@/assets/p-dress.jpg";
import kurta from "@/assets/p-kurta.jpg";

function Film({ src, webm, poster, title }: { src: string; webm: string; poster: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const manual = useRef(false);
  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !manual.current) void video.play().catch(() => setPlaying(false));
      else video.pause();
    }, { threshold: 0.35 });
    observer.observe(video);
    return () => { observer.disconnect(); video.pause(); };
  }, [reduced]);
  const toggle = async () => {
    const video = ref.current;
    if (!video) return;
    manual.current = true;
    if (video.paused) { try { await video.play(); } catch { setFailed(true); } }
    else video.pause();
  };
  return <div className="relative aspect-[4/3] overflow-hidden bg-primary-soft">
    <video ref={ref} poster={poster} muted loop playsInline preload="metadata" aria-label={title} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} className="h-full w-full object-contain"><source src={webm} type="video/webm" /><source src={src} type="video/mp4" /></video>
    {!failed && <Button variant="secondary" size="icon" aria-label={`${playing ? "Pause" : "Play"} ${title}`} onClick={() => void toggle()} className="absolute bottom-4 right-4 rounded-full shadow-soft">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>}
    {failed && <p role="status" className="absolute bottom-4 left-4 right-4 bg-background p-3 text-sm">This film is unavailable right now.</p>}
  </div>;
}

export function BrandFilms() {
  return <section className="overflow-hidden bg-sky/25 py-16 md:py-24" aria-labelledby="films-title"><div className="container-kidia">
    <div className="mb-9 flex items-end justify-between gap-5"><div><p className="eyebrow mb-3">The moving wardrobe</p><h2 id="films-title" className="section-title">Little stories in motion.</h2></div><Clapperboard aria-hidden="true" className="h-10 w-10 shrink-0 text-primary" strokeWidth={1} /></div>
    <div className="grid items-start gap-8 md:grid-cols-[1.3fr_0.8fr] md:gap-12">
      <div><Film src={wardrobe.url} webm={wardrobeWebm.url} poster={dress} title="KIDIA wardrobe film" /><div className="mt-4 flex items-center justify-between gap-4"><p className="font-serif text-xl italic">Everyday magic.</p><Button asChild variant="link" className="px-0"><Link to="/shop">Explore the wardrobe <ArrowUpRight className="h-4 w-4" /></Link></Button></div></div>
      <div className="relative md:mt-16"><Scissors aria-hidden="true" className="absolute -top-11 right-5 h-8 w-8 -rotate-12 text-accent" strokeWidth={1} /><Film src={festive.url} webm={festiveWebm.url} poster={kurta} title="KIDIA festive film" /><div className="mt-4 flex items-center gap-3"><Flower2 aria-hidden="true" className="h-7 w-7 text-marigold" strokeWidth={1} /><p className="font-serif text-xl italic">Made for little celebrations.</p></div><Button asChild variant="link" className="mt-2 px-0"><Link to="/collections/ethnic-festive">Discover festive styles <ArrowUpRight className="h-4 w-4" /></Link></Button></div>
    </div>
  </div></section>;
}