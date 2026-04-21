import { LEGAL } from "@/lib/legal";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: [
      `By accessing or using ${LEGAL.businessName}, you agree to be bound by these Terms of Service. If you do not agree with these terms, you should not use the service.`
    ]
  },
  {
    title: "2. Service Description",
    body: [
      `${LEGAL.businessName} provides AI-assisted fashion, styling, try-on, and recommendation features across web and mobile experiences. Some features may rely on third-party providers, including payment, analytics, AI, and marketplace integrations.`,
      "We may update, improve, limit, or discontinue parts of the service at any time."
    ]
  },
  {
    title: "3. Accounts and Access",
    body: [
      "You are responsible for maintaining the accuracy of your account information and for all activity under your account.",
      "You must not use the service for unlawful, abusive, fraudulent, or harmful activity, including attempts to interfere with platform security, availability, or other users."
    ]
  },
  {
    title: "4. Payments and Subscriptions",
    body: [
      "Certain features may require payment, subscription, or one-time credit purchases. Prices, included usage, and billing intervals are shown at checkout.",
      "Payments may be processed by third-party providers such as Paddle. By completing a purchase, you also agree to the applicable payment processor terms.",
      LEGAL.subscriptionCancellationPolicy
    ]
  },
  {
    title: "5. Refunds",
    body: [
      "Refund requests are governed by our Refund Policy. Approval is evaluated based on the circumstances of the purchase, account usage, and any applicable consumer protection requirements."
    ]
  },
  {
    title: "6. User Content",
    body: [
      "You retain ownership of images, measurements, prompts, and other content you submit. You grant us a limited license to host, process, transmit, and transform that content only as needed to operate and improve the service.",
      "You must only upload content that you have the right to use and that does not violate any law or third-party rights."
    ]
  },
  {
    title: "7. AI Output and Recommendations",
    body: [
      "AI-generated outputs, styling suggestions, and product recommendations are provided for informational and creative purposes only. They may be incomplete, inaccurate, or unsuitable for your needs.",
      "You are responsible for reviewing outputs before relying on them for purchasing, commercial, legal, medical, or other important decisions."
    ]
  },
  {
    title: "8. Intellectual Property",
    body: [
      `The service, branding, software, design, and related materials are owned by ${LEGAL.businessName} or its licensors and are protected by applicable intellectual property laws.`,
      "You may not copy, reverse engineer, resell, or exploit the service except as permitted by law or with written permission."
    ]
  },
  {
    title: "9. Third-Party Services",
    body: [
      "The service may contain links, embedded tools, affiliate links, or integrations with third-party services. We are not responsible for third-party products, content, policies, or availability."
    ]
  },
  {
    title: "10. Disclaimer of Warranties",
    body: [
      "The service is provided on an 'as is' and 'as available' basis without warranties of any kind, whether express or implied, to the fullest extent permitted by law."
    ]
  },
  {
    title: "11. Limitation of Liability",
    body: [
      `To the fullest extent permitted by law, ${LEGAL.businessName} will not be liable for indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, data, goodwill, or business opportunities arising from your use of the service.`
    ]
  },
  {
    title: "12. Termination",
    body: [
      "We may suspend or terminate access if we reasonably believe you violated these terms, created risk for the platform, or used the service unlawfully."
    ]
  },
  {
    title: "13. Changes to These Terms",
    body: [
      "We may update these Terms of Service from time to time. Continued use of the service after updated terms are posted means you accept the revised terms."
    ]
  },
  {
    title: "14. Governing Law",
    body: [
      `These Terms of Service are governed by ${LEGAL.jurisdiction}, unless mandatory consumer protection law in your place of residence requires otherwise.`,
      `Disputes arising from these terms will be subject to the exclusive jurisdiction of ${LEGAL.courts}, unless applicable law provides otherwise.`
    ]
  },
  {
    title: "15. Contact",
    body: [`For legal or billing questions, contact ${LEGAL.supportEmail}.`]
  }
];

export default function TermsPage() {
  return (
    <main className="section-shell py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3">
          <h1 className="section-title">Terms of Service</h1>
          <p className="section-copy">
            These Terms of Service govern your access to and use of {LEGAL.businessName} services,
            including our website, applications, and related features.
          </p>
          <p className="section-copy">Effective date: {LEGAL.effectiveDate}</p>
        </div>
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="section-copy">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
