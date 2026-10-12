import { PolicyShell, PolicySection } from "@/components/PolicyShell";

const Privacy = () => (
  <PolicyShell
    title="Privacy Policy"
    eyebrow="Your details, kept safely"
    description="KIDIA privacy policy: what personal information we collect, how we use and protect it, and how you can access, correct or delete it."
    updated="10 October 2026"
    intro="We collect only what we need to get the right clothes to the right child, and nothing more. This explains what we hold, why we hold it, and how you can ask us to change or remove it."
  >
    <PolicySection heading="What we collect">
      <ul className="list-disc space-y-2 pl-5">
        <li><strong>You give us:</strong> your name, email address, phone number, shipping address, and the details you add to your profile.</li>
        <li><strong>Orders:</strong> what you bought, sizes and colours chosen, and the history of your orders and returns.</li>
        <li><strong>Automatically:</strong> basic technical information such as device type and pages viewed, so we can see what's working and what isn't.</li>
      </ul>
    </PolicySection>

    <PolicySection heading="How we use it">
      <ul className="list-disc space-y-2 pl-5">
        <li>To take, pack, ship and follow up on your order.</li>
        <li>To answer questions you send us by email or WhatsApp.</li>
        <li>To send order updates — confirmation, dispatch, delivery.</li>
        <li>To improve the shop: which sizes sell out, which pages confuse people.</li>
      </ul>
      <p>We don't sell your personal information, and we don't share it for someone else's marketing.</p>
    </PolicySection>

    <PolicySection heading="Where it's stored">
      <p>Your account and order information is held in our own hosted database with access controls, and only our team and the services we rely on (hosting, shipping, payment processing) can reach it. When online payments are enabled, card and UPI details are handled by our payment partner — we never store full card numbers on our servers.</p>
    </PolicySection>

    <PolicySection heading="Cookies and your device">
      <p>We use small local storage entries on your device so your bag and wishlist are still there when you come back, and so you stay signed in. These don't track you across other websites, and you can clear them any time from your browser settings — your bag and wishlist will simply start empty.</p>
    </PolicySection>

    <PolicySection heading="Who we share it with">
      <p>Only the partners needed to complete your order: a courier to deliver the parcel, a payment provider when payments are live, and our hosting and email services to run the shop. Each of them is allowed to use your details only for that job.</p>
    </PolicySection>

    <PolicySection heading="How long we keep it">
      <p>For as long as you keep your account open, and for order records for as long as accounting and tax rules require. You can ask us to delete your account and personal details at any time; we'll keep only what the law obliges us to keep.</p>
    </PolicySection>

    <PolicySection heading="Your choices">
      <p>You can ask to see the personal information we hold about you, correct anything that's wrong, or ask us to delete it. Email us from the address on your account and we'll act within 30 days. You can also stop any marketing messages with the unsubscribe link in them, and order updates will still come through.</p>
    </PolicySection>

    <PolicySection heading="Children">
      <p>KIDIA sells children's clothing, but our accounts are held by a parent or guardian. We don't knowingly collect personal information directly from children — please keep your child's own details out of the fields on this site.</p>
    </PolicySection>

    <PolicySection heading="Changes to this policy">
      <p>If we change how we handle information, we'll update this page and its "last updated" date, and tell you about significant changes before they take effect.</p>
    </PolicySection>
  </PolicyShell>
);

export default Privacy;
