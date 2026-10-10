import { PolicyShell, PolicySection } from "@/components/PolicyShell";

const Terms = () => (
  <PolicyShell
    title="Terms & Conditions"
    eyebrow="The fair-and-clear rules"
    description="KIDIA terms and conditions for using our website, placing orders, and the responsibilities of shoppers and of KIDIA."
    updated="10 October 2026"
    intro="Plain-language terms so there are no surprises. By browsing the shop or placing an order you agree to what's written here."
  >
    <PolicySection heading="About KIDIA">
      <p>KIDIA is an Indian kidswear brand for children aged 1–12, designing and selling everyday, festive and special-occasion clothing through this website. These terms apply to the website, your account and every order placed here.</p>
    </PolicySection>

    <PolicySection heading="Using our website">
      <ul className="list-disc space-y-2 pl-5">
        <li>Use the site lawfully and for personal shopping, not for reselling in bulk without our written agreement.</li>
        <li>Don't interfere with the site, attempt to access other people's accounts, or scrape our catalogue and images.</li>
        <li>You're responsible for keeping your login details safe, and for anything that happens under your account.</li>
      </ul>
    </PolicySection>

    <PolicySection heading="Accounts">
      <p>You can browse as a guest, but an account keeps your bag, wishlist, sizes and order history together. Please give accurate details — wrong addresses and phone numbers are the most common reason a parcel fails to arrive. You can delete your account whenever you like.</p>
    </PolicySection>

    <PolicySection heading="Products, images and sizing">
      <p>Product photos aim to show a piece as it really looks, but screen colours vary and hand-finished details differ slightly from piece to piece — that's part of buying children's clothing made in small runs. Sizes are labelled by age, and we recommend choosing by height first and then checking the garment measurements on each product page. Between sizes, the larger one gives room to grow.</p>
    </PolicySection>

    <PolicySection heading="Prices and availability">
      <p>All prices are in Indian Rupees (INR) and include GST unless stated otherwise. Prices may change; the price shown at the time you place an order is the price we honour, subject to stock. If an item sells out after you order, we'll tell you promptly and refund you in full.</p>
    </PolicySection>

    <PolicySection heading="Orders and payment">
      <p>An order is a request until we confirm it. Order confirmation, dispatch and delivery updates are sent to your email and phone. When online checkout goes live, payments are processed by our payment partner and the amount you pay is shown before you confirm. Coupons and offers work only as described on the site, and one order can't be split across multiple discounts unless stated.</p>
    </PolicySection>

    <PolicySection heading="Delivery">
      <p>Shipping timelines are estimates, not guarantees, and start from dispatch rather than order placement. Delays caused by courier disruptions, weather, or a delivery address we can't reach are outside our control — we'll always keep you informed and do our best to get the parcel to you.</p>
    </PolicySection>

    <PolicySection heading="Returns and refunds">
      <p>Return windows, eligibility and refund timelines are set out in our Refund &amp; Returns Policy, which forms part of these terms. Please read it before ordering festive and sale pieces.</p>
    </PolicySection>

    <PolicySection heading="Our content and brand">
      <p>The KIDIA name, logo, photographs, illustrations and written content belong to us. You may share our product pages and posts on social media with credit, but you can't copy our images or descriptions for your own shop or reuse them commercially without permission.</p>
    </PolicySection>

    <PolicySection heading="Third-party links">
      <p>Some pages link to other websites, such as Instagram or WhatsApp. Once you're there, their terms and privacy practices apply — we aren't responsible for what happens on another site.</p>
    </PolicySection>

    <PolicySection heading="Limits on our responsibility">
      <p>We're responsible for the clothing we sell and for following our return and refund promises. We aren't liable for indirect losses, and in any case our responsibility for an order is limited to the amount you paid for it. Nothing here limits rights you have under Indian consumer law.</p>
    </PolicySection>

    <PolicySection heading="Changes to these terms">
      <p>We may update these terms as the shop grows — new payment options, new delivery areas, new rules. The version on this page at the time you order is the one that applies, and we'll mark the "last updated" date.</p>
    </PolicySection>

    <PolicySection heading="Governing law">
      <p>These terms are governed by the laws of India, and the courts at our registered place of business have jurisdiction over any dispute.</p>
    </PolicySection>
  </PolicyShell>
);

export default Terms;
