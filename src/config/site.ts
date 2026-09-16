export const siteConfig = {
  name: "Dreamscape Treks™",
  legalName: "Dreamscape Treks & Expeditions Pvt. Ltd.",
  tagline: "Unrivaled Himalayan Expeditions Across Nepal & Beyond",
  description:
    "Premier adventure trekking and climbing agency specializing in Everest, Annapurna, Manaslu, Mustang, Langtang, Dolpo, Tibet, Bhutan, and Indian Himalayas. Certified Sherpa guides, ethical tourism, and bespoke expeditions.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.dreamscapetreks.com",
  ogImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  destinations: ["Nepal", "Tibet", "Bhutan", "India"] as const,
  majorRegions: [
    "Everest",
    "Annapurna",
    "Langtang",
    "Manaslu",
    "Mustang",
    "Dolpo",
    "Kanchenjunga",
    "Makalu",
    "Rolwaling",
  ] as const,
  contact: {
    email: "expeditions@dreamscapetreks.com",
    phone: "+977 1 4412345",
    whatsapp: "+977 9851012345",
    address: {
      street: "Thamel Marg, Ward 26",
      city: "Kathmandu",
      country: "Nepal",
      postalCode: "44600",
    },
  },
  socials: {
    instagram: "https://instagram.com/dreamscapetreks",
    facebook: "https://facebook.com/dreamscapetreks",
    youtube: "https://youtube.com/@dreamscapetreks",
    x: "https://x.com/dreamscapetreks",
  },
  accreditations: [
    "Nepal Tourism Board (NTB)",
    "Trekking Agencies Association of Nepal (TAAN)",
    "Nepal Mountaineering Association (NMA)",
    "Himalayan Rescue Association (HRA)",
  ],
};
