"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

const TERMS_OF_SERVICE = `
Terms of Service
Last updated: February 2026

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

Even when backups exist, CertainShare does not guarantee that any content can be recovered after deletion.

5. Account Deletion & Data Retention
You may request permanent deletion of your CertainShare account at any time through your account settings.

When you request deletion:
- Your account is immediately disabled.
- You are logged out of all devices.
- Your content will no longer be accessible through the platform.

CertainShare may retain your data for up to 30 days after a deletion request for operational, security, fraud prevention, abuse enforcement, and legal compliance purposes. After this retention period, your account data and stored media will be permanently deleted, subject to any legal obligations that require longer retention.

Account deletion cannot be undone.

If you delete your account while subscribed to a paid plan, your subscription may be canceled automatically.

6. Right to Remove Content & Accounts
CertainShare may remove content, restrict access, or suspend accounts if required by law or to protect the platform.

7. Cooperation With Law Enforcement
We may comply with lawful requests, subpoenas, warrants, or court orders.

8. Privacy Policy (Summary)
We collect only the data required to operate CertainShare.
We do not sell user data or run ads.

9. No Security Marketing Claims
We do not claim "military-grade" or "unbreakable" security.

10. CSAM & Illegal Content (Zero Tolerance)
Confirmed CSAM results in immediate termination and reporting to NCMEC and law enforcement as required.

11. Limitation of Liability
CertainShare is provided "as-is." We make no warranties regarding uninterrupted availability or the long-term preservation of content.

12. Changes to These Terms
We may update these Terms as the platform evolves. Continued use of CertainShare means you accept the updated Terms.

13. Contact
legal@certainshare.com
`;

const PRIVACY_POLICY = `
Privacy Policy
Last updated: February 2026

CertainShare is built to collect as little personal data as possible while still operating a secure media storage and sharing platform.

1. What We Collect
We may collect and store:
- Email address
- Account settings and profile information
- Uploaded content (photos and videos)
- Sharing and folder metadata
- Security logs (IP address, login timestamps, device/session information)
- Payment and subscription status (processed through third-party payment providers)

We do not collect:
- Advertising data
- Behavioral tracking for monetization
- Contacts or address books

2. Why We Collect It
We collect data only to:
- Operate the service
- Provide storage and sharing functionality
- Maintain account security
- Prevent fraud, abuse, and illegal activity
- Comply with legal obligations

3. Data Sharing
We do not sell user data.

We may share limited data only:
- with service providers required to operate the platform
- to comply with lawful legal requests
- to protect CertainShare, our users, or the public from harm or abuse

4. Service Providers
CertainShare uses third-party providers to operate infrastructure and payment processing. These providers may process data only as required to provide their services, and are not permitted to use your data for advertising purposes.

Examples include:
- Cloud hosting providers
- Cloud storage providers
- Payment processors

5. Data Retention
We retain your content and account information for as long as your account remains active.

If you request account deletion, your account is disabled immediately and your content is removed from active access. CertainShare may retain data for up to 30 days before permanent deletion for operational, security, fraud prevention, abuse enforcement, and legal compliance purposes.

Certain logs or limited records may be retained longer if required to comply with legal obligations.

6. Child Safety
We enforce zero tolerance for illegal content including CSAM and report as required.

7. Legal Requests
We may disclose information if required by law, subpoena, warrant, or court order.

8. Contact
privacy@certainshare.com
`;

const ACCEPTABLE_USE_POLICY = `
Acceptable Use Policy (AUP)
Last updated: February 2026

You may not upload, store, or share illegal content.

Zero tolerance for CSAM.
Harassment, stalking, threats, and exploitation are prohibited.
Automated abuse (bots, scraping, bypassing security) is prohibited.

Violations may result in permanent termination.
`;

const ABUSE_AND_SAFETY = `
Abuse & Safety Reporting
Last updated: February 2026

To report abuse or illegal content:
report@certainshare.com

Include:
- description of issue
- screenshots or links if possible

CSAM will be reported to NCMEC and law enforcement as required.
`;

const BACKUPS_AND_RETENTION = `
Backups & Data Retention Disclosure
Last updated: February 2026

CertainShare is designed to minimize data retention while still supporting account security and legal compliance.

1. Active Accounts
We store your uploaded media and account data for as long as your account remains active.

2. Deleted Content
If you delete content or request account deletion, the content is removed from your active account experience. However, CertainShare may retain deleted content for up to 30 days before permanent deletion.

This retention period exists for operational, security, fraud prevention, abuse enforcement, and legal compliance purposes.

3. Account Deletion
If you request account deletion:
- your account is immediately disabled
- you will lose access permanently
- your data will be permanently deleted after up to 30 days

Account deletion cannot be undone.

4. Backups
Free accounts:
- no backup guarantees

Paid accounts:
- backup retention depends on your subscription tier

Backup copies, if they exist, are also subject to retention limits and may be deleted automatically.

5. Legal Obligations
In rare cases, we may retain limited data longer if required by law.
`;

const CONTACT_AND_LEGAL = `
Contact & Legal Information
Last updated: February 2026

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