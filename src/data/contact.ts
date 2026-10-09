// Single place for KIDIA contact details. Replace the placeholders with real ones.
export const CONTACT = {
  email: "hello@kidia.in",
  phoneDisplay: "+91 00000 00000",
  whatsappNumber: "910000000000", // country code + number, digits only
  instagramHandle: "kidia.in",
  hours: "Mon–Sat, 10am–7pm IST",
};
export const whatsappUrl = (msg = "Hi KIDIA! I'd like some help.") =>
  `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(msg)}`;
export const instagramUrl = `https://instagram.com/${CONTACT.instagramHandle}`;
