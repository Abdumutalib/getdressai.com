import { LEGAL } from "@/lib/legal";

const sections = [
  {
    title: "1. General Policy",
    body: [
      `We review refund requests fairly and in good faith. Because ${LEGAL.businessName} may provide immediate digital access, generated outputs, credits, or subscription benefits, refunds are not automatically guaranteed once the service has been used.`
    ]
  },
  {
    title: "2. When a Refund May Be Approved",
    body: [
      "A refund may be approved in cases such as duplicate charges, technical billing errors, unauthorized transactions subject to review, or a material failure of the paid service that we cannot reasonably resolve."
    ]
  },
  {
    title: "3. When a Refund May Be Denied",
    body: [
      "Refunds may be denied when a user has already substantially used subscription benefits, consumed purchased credits, received generated outputs, violated the Terms of Service, or submitted the request after an unreasonable delay."
    ]
  },
  {
    title: "4. Request Process",
    body: [
      `To request a refund, contact ${LEGAL.supportEmail} and include the purchase email, transaction details, date of charge, and a short explanation of the issue.`,
      `We aim to review requests within ${LEGAL.refundReviewWindow}, although complex cases may take longer.`
    ]
  },
  {
    title: "5. Processing",
    body: [
      "If approved, refunds are sent to the original payment method.",
      "Card refunds typically take 3 to 5 working days after processing, though final timing depends on your payment processor, bank, and card provider."
    ]
  },
  {
    title: "6. Chargebacks",
    body: [
      "If you believe a transaction is fraudulent, please contact us before opening a chargeback where possible so we can help investigate and resolve the issue quickly."
    ]
  },
  {
    title: "7. Subscription Cancellations",
    body: [LEGAL.subscriptionCancellationPolicy]
  }
];

export default function RefundPolicyPage() {
  return (
    <main className="section-shell py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3">
          <h1 className="section-title">Refund Policy</h1>
          <p className="section-copy">
            This Refund Policy explains how {LEGAL.businessName} handles refund requests for
            subscriptions, one-time purchases, and digital service payments.
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
