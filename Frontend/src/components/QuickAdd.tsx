import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product, formatINR } from "@/data/catalog";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export const OptionPickers = ({ p, size, setSize, colour, setColour }: { p: Product; size: string; setSize: (s: string) => void; colour: string; setColour: (c: string) => void }) => (
  <div className="space-y-5">
    <div>
      <p className="mb-2 text-sm font-bold">Colour: <span className="font-normal text-muted-foreground">{colour || "Select"}</span></p>
      <div className="flex gap-2">
        {p.colours.map((c) => (
          <button key={c.name} type="button" aria-label={c.name} aria-pressed={colour === c.name} onClick={() => setColour(c.name)}
            className={cn("h-9 w-9 rounded-full border-2 transition", colour === c.name ? "border-primary ring-2 ring-primary/30" : "border-border")} style={{ backgroundColor: c.hex }} />
        ))}
      </div>
    </div>
    <div>
      <p className="mb-2 text-sm font-bold">Size (age): <span className="font-normal text-muted-foreground">{size || "Select"}</span></p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(p.stock).map(([s, n]) => (
          <button key={s} type="button" disabled={n === 0} aria-pressed={size === s} onClick={() => setSize(s)}
            className={cn("min-w-14 rounded-full border px-3 py-2 text-sm font-semibold transition", size === s ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary", n === 0 && "cursor-not-allowed opacity-40 line-through")}>
            {s}
          </button>
        ))}
      </div>
      {size && p.stock[size] > 0 && p.stock[size] <= 3 && <p className="mt-2 text-xs text-muted-foreground">Only {p.stock[size]} left in this size.</p>}
    </div>
  </div>
);

export const QuickAdd = ({ p, open, onOpenChange }: { p: Product; open: boolean; onOpenChange: (o: boolean) => void }) => {
  const add = useCart((s) => s.add);
  const [size, setSize] = useState("");
  const [colour, setColour] = useState(p.colours.length === 1 ? p.colours[0].name : "");
  const ready = size && colour;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl">
        <div className="flex gap-4">
          <img src={p.images[0]} alt="" className="h-36 w-28 rounded-xl object-cover" />
          <div>
            <DialogTitle className="font-serif text-xl">{p.name}</DialogTitle>
            <DialogDescription className="mt-1 font-bold text-foreground">{formatINR(p.price)}</DialogDescription>
            <Link to={`/product/${p.slug}`} className="mt-2 inline-block text-sm text-primary underline">View full details</Link>
          </div>
        </div>
        <OptionPickers p={p} size={size} setSize={setSize} colour={colour} setColour={setColour} />
        <Button disabled={!ready} className="h-12 rounded-full" onClick={() => { add(p, size, colour); toast.success("Added to bag", { description: `${p.name} · ${size} · ${colour}` }); onOpenChange(false); }}>
          {ready ? "Add to Bag" : "Select colour and size"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
