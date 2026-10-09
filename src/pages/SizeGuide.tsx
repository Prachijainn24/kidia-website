import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SizeChart } from "@/components/SizeChart";
import { AGE_GROUPS } from "@/data/catalog";

const SizeGuide = () => (
  <Layout title="Size Guide" description="KIDIA size guide for kids aged 1–12 years: height, chest, waist and garment length.">
    <div className="container-kidia max-w-4xl py-12">
      <p className="eyebrow mb-2">Find their perfect fit</p>
      <h1 className="font-serif text-4xl md:text-5xl">Size Guide</h1>
      <p className="mt-4 text-muted-foreground">Our sizes are labelled by age, but every child grows differently. We recommend choosing by <strong>height</strong> first, then checking chest and waist.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[["1. Height", "Stand straight against a wall, without shoes, and measure from floor to the top of the head."], ["2. Chest", "Measure around the fullest part of the chest, under the arms, keeping the tape snug but not tight."], ["3. Waist", "Measure around the natural waistline, just above the belly button."]].map(([t, d]) => (
          <div key={t} className="rounded-3xl bg-secondary p-6"><h2 className="font-serif text-xl">{t}</h2><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>
        ))}
      </div>

      <h2 className="mt-12 mb-4 font-serif text-2xl">KIDIA size chart (cm)</h2>
      <SizeChart />
      <p className="mt-3 text-xs text-muted-foreground">These are KIDIA brand measurements, not universal standards, and may vary slightly by style. Please check the garment measurements on each product before ordering. Between sizes? Choose the larger one for room to grow.</p>

      <h2 className="mt-12 mb-4 font-serif text-2xl">Shop by age</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {AGE_GROUPS.map((a) => <Link key={a.slug} to={`/shop?age=${a.slug}`} className={`rounded-2xl p-5 text-center font-bold ${a.tone}`}>{a.label}</Link>)}
      </div>
    </div>
  </Layout>
);
export default SizeGuide;
