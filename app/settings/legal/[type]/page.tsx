"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

const TERMS_OF_SERVICE = `
Terms of Service
Last updated: December 2025

By accessing or using CertainShare ("CertainShare," "we," "us," or "our"), you agree to these Terms of Service ("Terms"). If you do not agree, do not use the service.

1. Eligibility
You must be at least 13 years old to use CertainShare.

2. Your Content & Ownership
You own what you upload.
You retain full ownership of all content you upload, store, or share on CertainShare.

3. License to Operate the Service
To operate the platform, you grant CertainShare a limited, non-exclusive license to store, process, transmit, and display your content only as necessary to provide the service.

4. Backups & Data Responsibility
Free Accounts: No backups are guaranteed.
Paid Accounts: Backup retention applies only as explicitly defined by your plan.

5. Right to Remove Content & Accounts
CertainShare may remove content or suspend accounts if required by law or to protect the platform.

6. Cooperation With Law Enforcement
We may comply with lawful requests, subpoenas, warrants, or court orders.

7. Privacy Policy (Summary)
We collect minimal data to operate the service.
We do not sell user data or run ads.

8. No Security Marketing Claims
We do not claim "military-grade" or "unbreakable" security.

9. CSAM & Illegal Content (Zero Tolerance)
Confirmed CSAM results in immediate termination and reporting to NCMEC.

10. Limitation of Liability
CertainShare is provided "as-is."

11. Changes to These Terms
We may update these Terms as the platform evolves.

12. Contact
legal@certainshare.com
`;

const PRIVACY_POLICY = `
Privacy Policy
Last updated: December 2025

CertainShare is built to collect as little personal data as possible while still operating a secure media-sharing platform.

1. What We Collect
- Email address
- Account settings
- Uploaded content
- Security logs (IP, login timestamps)

We do not collect:
- Advertising data
- Behavioral tracking for monetization
- Contacts/address books

2. Why We Collect It
- Operate the service
- Prevent fraud/abuse
- Comply with law

3. Data Sharing
We do not sell user data.
We only share data when required to operate the service or comply with law.

4. Child Safety
We enforce zero tolerance for illegal content including CSAM and report as required.

5. Contact
privacy@certainshare.com
`;

const ACCEPTABLE_USE_POLICY = `
Acceptable Use Policy (AUP)
Last updated: December 2025

You may not upload or share illegal content.

Zero tolerance for CSAM.
Harassment, stalking, threats, and exploitation are prohibited.
Automated abuse (bots, scraping, bypassing security) is prohibited.

Violations may result in permanent termination.
`;

const ABUSE_AND_SAFETY = `
Abuse & Safety Reporting
Last updated: December 2025

To report abuse or illegal content:
report@certainshare.com

Include:
- description of issue
- screenshots or links if possible

CSAM will be reported to NCMEC and law enforcement as required.
`;

const BACKUPS_AND_RETENTION = `
Backups & Data Retention Disclosure
Last updated: December 2025

Free accounts:
- no backups guaranteed
- deleted content may be unrecoverable

Paid accounts:
- backup retention depends on plan tier
- retention windows are enforced automatically

No indefinite retention is guaranteed unless explicitly stated.
`;

const CONTACT_AND_LEGAL = `
Contact & Legal Information
Last updated: December 2025

Support: support@certainshare.com
Legal: legal@certainshare.com
Privacy: privacy@certainshare.com
Reporting: report@certainshare.com
`;

export default function LegalDetailPage() {
  const params = useParams();
  const type = params?.type as string;

  let title = "Legal";
  let content = "Content coming soon.";

  if (type === "terms") {
    title = "Terms of Service";
    content = TERMS_OF_SERVICE;
  } else if (type === "privacy") {
    title = "Privacy Policy";
    content = PRIVACY_POLICY;
  } else if (type === "aup") {
    title = "Acceptable Use Policy";
    content = ACCEPTABLE_USE_POLICY;
  } else if (type === "abuse") {
    title = "Abuse & Safety Reporting";
    content = ABUSE_AND_SAFETY;
  } else if (type === "backups") {
    title = "Backups & Data Retention";
    content = BACKUPS_AND_RETENTION;
  } else if (type === "contact") {
    title = "Contact & Legal";
    content = CONTACT_AND_LEGAL;
  }

  return (
    <main style={styles.page}>

      <div style={styles.container}>
        <h1 style={styles.title}>{title}</h1>

        <div style={styles.card}>
          <pre style={styles.pre}>{content}</pre>
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 14 }}>
          <Link href="/settings/legal" style={styles.link}>
            ← Back to Legal Index
          </Link>

          <Link href="/settings" style={styles.link}>
            Settings
          </Link>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#f6f7fb",
    minHeight: "100vh",
  },

  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 30,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
  },

  card: {
    borderRadius: 16,
    background: "white",
    border: "1px solid #e5e7eb",
    padding: 18,
    boxShadow: "0px 10px 25px rgba(0,0,0,0.05)",
  },

  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    fontSize: 14,
    lineHeight: "22px",
    color: "#111827",
    fontFamily: "inherit",
  },

  link: {
    textDecoration: "none",
    fontWeight: "bold",
    color: "#2563eb",
  },
};