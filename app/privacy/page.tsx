import { LEGAL } from "@/lib/legal";

const sections = [
  {
    title: "1. Information We Collect",
    body: [
      "We may collect account details, contact information, images you upload, prompts, measurements, purchase records, usage data, device information, and technical logs necessary to operate the service.",
      "When you interact with payments, analytics, email, or AI tools, relevant data may be processed through trusted third-party providers acting on our behalf or under their own policies."
    ]
  },
  {
    title: "2. How We Use Information",
    body: [
      "We use personal information to provide the service, authenticate users, process payments, generate outputs, improve product performance, detect abuse, respond to support requests, and communicate important service updates."
    ]
  },
  {
    title: "3. Legal Bases and Consent",
    body: [
      "Where applicable, we process information based on contract performance, legitimate interests, legal obligations, and consent. If consent is required for a specific activity, you may withdraw it subject to legal and operational limits."
    ]
  },
  {
    title: "4. Sharing of Information",
    body: [
      "We may share information with infrastructure, analytics, email, AI, authentication, storage, and payment providers as needed to run the service.",
      "We may also disclose information if required by law, to enforce our terms, or to protect the rights, safety, and security of users or the platform."
    ]
  },
  {
    title: "5. Payments",
    body: [
      "Payment transactions may be processed by third-party payment providers such as Paddle. We do not store full payment card details on our own systems unless explicitly stated.",
      "Where Paddle acts as merchant of record for a transaction, buyer payment processing and certain payment-related records may also be handled under Paddle's own legal and privacy framework."
    ]
  },
  {
    title: "6. Data Retention",
    body: [
      "We keep personal information only for as long as reasonably necessary for service delivery, security, legal compliance, dispute resolution, and legitimate business operations."
    ]
  },
  {
    title: "7. Security",
    body: [
      "We use reasonable administrative, technical, and organizational safeguards to protect data. However, no system can guarantee absolute security."
    ]
  },
  {
    title: "8. Your Rights",
    body: [
      "Depending on your location, you may have rights to access, correct, delete, restrict, or export your personal information, and to object to certain processing. You may contact us to make a request."
    ]
  },
  {
    title: "9. International Transfers",
    body: [
      "Your information may be processed in countries other than your own, including by service providers operating internationally."
    ]
  },
  {
    title: "10. Children's Privacy",
    body: [
      "The service is not intended for children where prohibited by law, and we do not knowingly collect personal information from children in violation of applicable requirements."
    ]
  },
  {
    title: "11. Updates to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. The latest version posted on this page will apply from its effective publication date."
    ]
  },
  {
    title: "12. Contact",
    body: [
      `For privacy questions or requests, contact ${LEGAL.supportEmail}.`,
      `${LEGAL.operatorName} is the operator responsible for this service privacy notice unless a payment processor acts as an independent controller for its own regulated payment activities.`
    ]
  }
];

export default function PrivacyPage() {
  return (
    <main className="section-shell py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3">
          <h1 className="section-title">Privacy Policy</h1>
          <p className="section-copy">
            This Privacy Policy explains how {LEGAL.businessName} collects, uses, stores, and shares
            personal information when you use our website, applications, and related services.
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
