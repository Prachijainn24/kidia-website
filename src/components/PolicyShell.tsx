import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CONTACT, whatsappUrl } from "@/data/contact";

type ShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  updated: string;
  intro: string;
  children: ReactNode;
};

export const PolicyShell = ({ title, eyebrow, description, updated, intro, children }: ShellProps) => (
  <Layout title={title} description={description}>
    <div className="container-kidia max-w-3xl py-12 md:py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />Back to home
      </Link>

      <p className="eyebrow mt-8 mb-2">{eyebrow}</p>
      <h1 className="font-serif text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 text-muted-foreground">{intro}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">Last updated: {updated}</p>

      <div className="mt-10 space-y-10">{children}</div>

      <div className="mt-12 rounded-3xl bg-secondary p-6">
        <h2 className="font-serif text-xl">Still need a hand?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Email <a href={`mailto:${CONTACT.email}`} className="font-semibold text-primary hover:underline">{CONTACT.email}</a>{" "}
          or{" "}
          <a href={whatsappUrl("Hi KIDIA! I have a question about my order.")} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
            message us on WhatsApp
          </a>
          . Our hours are {CONTACT.hours}.
        </p>
      </div>
    </div>
  </Layout>
);

export const PolicySection = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <section>
    <h2 className="mb-3 font-serif text-2xl">{heading}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">{children}</div>
  </section>
);
