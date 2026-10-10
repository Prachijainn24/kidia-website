import { PolicyShell, PolicySection } from "@/components/PolicyShell";

const RefundReturns = () => (
  <PolicyShell
    title="Refund & Returns Policy"
    eyebrow="Shopping with confidence"
    description="KIDIA refund and returns policy for kids' clothing: the 7-day return window, how to start a return, exchange rules and refund timelines."
    updated="10 October 2026"
    intro="Every KIDIA piece is checked before it leaves us. If something isn't right — the size doesn't fit, the colour looks different in daylight, or a parcel reaches you damaged — here's exactly how returns, exchanges and refunds work."
  >
    <PolicySection heading="The short version">
      <ul className="list-disc space-y-2 pl-5">
        <li>You have <strong>7 days from the day your order arrives</strong> to ask for a return or an exchange.</li>
        <li>Pieces must be unworn, unwashed and unstained, with the original tags and packaging intact.</li>
        <li>Refunds reach your original payment method within <strong>5–7 working days</strong> of the parcel reaching us.</li>
        <li>If we sent the wrong item or yours arrived damaged, the replacement or refund is on us.</li>
      </ul>
    </PolicySection>

    <PolicySection heading="What we can take back">
      <p>Clothing, sets and festive pieces bought from our website, returned within 7 days of delivery, in the condition described above. Please keep the invoice or order confirmation handy — it makes everything faster.</p>
    </PolicySection>

    <PolicySection heading="What we can't take back">
      <ul className="list-disc space-y-2 pl-5">
        <li>Innerwear, socks and any piece marked as final sale on the product page.</li>
        <li>Items that have been worn outside the house of a trial fitting, washed, ironed, altered or stained.</li>
        <li>Items returned after the 7-day window, or without their original tags.</li>
        <li>Gift cards and personalised pieces made to your request.</li>
      </ul>
    </PolicySection>

    <PolicySection heading="How to start a return">
      <ol className="list-decimal space-y-2 pl-5">
        <li>Write to us by email or WhatsApp with your order number and the item's name.</li>
        <li>Tell us the reason (size, quality, wrong item, changed mind) and add a photo if there is a defect — it helps us fix things at our end.</li>
        <li>We'll confirm the return and share the address to send the parcel to, along with the next steps.</li>
        <li>Pack the piece in its original packaging, with tags attached, and ship it back.</li>
      </ol>
      <p>For your safety, please use a trackable courier and keep the receipt. We can't process a refund for a parcel that never reaches us.</p>
    </PolicySection>

    <PolicySection heading="Refund timelines">
      <p>Once your returned parcel arrives and passes our check, we approve the refund the same working day. Banks and card networks then take <strong>5–7 working days</strong> to show the credit in your account — that part is out of our hands, and we'll keep you posted at every step.</p>
      <p>Shipping charges are refunded only when the return is because of a mistake or defect on our side.</p>
    </PolicySection>

    <PolicySection heading="Exchanges and size swaps">
      <p>Between sizes? We're happy to swap for a different size or colour, subject to stock. Tell us the size you need when you raise the return. If the size you want is sold out, we'll offer a refund instead, or hold your place on the waiting list if you'd rather wait.</p>
    </PolicySection>

    <PolicySection heading="Damaged, defective or wrong item">
      <p>Message us within 7 days of delivery with photos of the item and the packaging. We'll arrange a replacement or a full refund, including return shipping paid by us. No questions, no fuss.</p>
    </PolicySection>

    <PolicySection heading="Who pays for return shipping">
      <p>If you've simply changed your mind or need a different size, return shipping is at your cost. If the fault is ours — wrong item, damage, manufacturing defect — we cover it.</p>
    </PolicySection>

    <PolicySection heading="Festive and sale pieces">
      <p>Diwali, Navratri and sale pieces follow the same 7-day rule unless the product page says <strong>final sale</strong>. Because festive stock is made in limited runs, we'd gently ask you to check the size chart before ordering — the garment measurements on each product page are the most reliable guide.</p>
    </PolicySection>

    <PolicySection heading="Parcel delayed or never delivered">
      <p>Tell us the day it was due and we'll trace it with the courier. If it's declared lost, you'll be refunded or resent a replacement, your choice.</p>
    </PolicySection>
  </PolicyShell>
);

export default RefundReturns;
