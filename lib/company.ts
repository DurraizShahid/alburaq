export const companyDetails = {
  name: "Al Buraq LTD",
  supportPhoneDisplay: "+44 7448 203520",
  supportPhoneHref: "tel:+447448203520",
  supportEmail: "customersupport@al-buraq.co.uk",
  supportEmailHref: "mailto:customersupport@al-buraq.co.uk",
  supportHours: "Monday to Friday: 9AM - 5PM",
  addressLines: ["Unit 12, 20 River Road", "Barking, England", "IG11 0DG"],
  mapsHref:
    "https://maps.google.com/?q=Unit+12,+20+River+Road,+Barking,+England,+IG11+0DG",
} as const

export const supportHighlights = [
  {
    title: "Order updates",
    description: "Get help with dispatch timing, tracking, delivery questions, and order status.",
  },
  {
    title: "Shipping and returns",
    description: "Ask about delivery windows, damaged parcels, and return eligibility before or after purchase.",
  },
  {
    title: "Fragrance guidance",
    description: "Receive support with scent matching, gifting decisions, and layering recommendations.",
  },
  {
    title: "Business requests",
    description: "Contact the team for gifting, event fragrance curation, and wholesale-style conversations.",
  },
] as const

export const supportFaqs = [
  {
    question: "How can I contact customer support?",
    answer:
      "You can reach Al Buraq customer support by phone at +44 7448 203520 or by email at customersupport@al-buraq.co.uk during Monday to Friday, 9AM - 5PM.",
  },
  {
    question: "What should I include when asking about an order?",
    answer:
      "Include your order number, the name used at checkout, and a short description of the issue so the team can review your request faster.",
  },
  {
    question: "Can I get help choosing a fragrance gift?",
    answer:
      "Yes. The support team can help with gifting suggestions, scent family guidance, and shortlists based on mood, style, or occasion.",
  },
  {
    question: "Where is Al Buraq LTD located?",
    answer:
      "The business address is Unit 12, 20 River Road, Barking, England, IG11 0DG.",
  },
] as const
