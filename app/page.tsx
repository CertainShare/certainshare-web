"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
  }, []);

  return (
    <main style={styles.page}>
      {/* NAV */}
      <header style={styles.navWrapper}>
        <div style={styles.navInner}>
          <div style={styles.brandRow}>
            <div style={styles.logoCircle}>CS</div>
            <div style={styles.brandText}>CertainShare</div>
          </div>

          <div style={styles.navActions}>
            {hasToken ? (
              <Link href="/mymedia" style={styles.navButtonPrimary}>
                Go to My Media
              </Link>
            ) : (
              <>
                <Link href="/login" style={styles.navButton}>
                  Log in
                </Link>
                <Link href="/signup" style={styles.navButtonPrimary}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.heroSection}>
        <div style={styles.heroInner}>
          <div style={styles.heroLeft}>
            <div style={styles.heroBadge}>Privacy-first media storage</div>

            <h1 style={styles.heroTitle}>
              Your photos and videos.
              <br />
              Shared intentionally.
            </h1>

            <p style={styles.heroSubtitle}>
              CertainShare is a private media vault built for families and real
              life. Store your memories, control who sees them, and never worry
              about your data being mined.
            </p>

            <div style={styles.heroButtons}>
              {hasToken ? (
                <Link href="/mymedia" style={styles.primaryButton}>
                  Go to My Media
                </Link>
              ) : (
                <>
                  <Link href="/signup" style={styles.primaryButton}>
                    Create free account
                  </Link>
                  <Link href="/login" style={styles.secondaryButton}>
                    Log in
                  </Link>
                </>
              )}
            </div>

            <div style={styles.heroTrustRow}>
              <div style={styles.trustItem}>
                <div style={styles.trustTitle}>No ads</div>
                <div style={styles.trustSub}>No tracking. No algorithms.</div>
              </div>

              <div style={styles.trustItem}>
                <div style={styles.trustTitle}>Private sharing</div>
                <div style={styles.trustSub}>
                  Control exactly who sees your media.
                </div>
              </div>

              <div style={styles.trustItem}>
                <div style={styles.trustTitle}>Built for families</div>
                <div style={styles.trustSub}>
                  Albums, friends, and safe storage.
                </div>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.heroCard}>
              <div style={styles.previewTop}>
                <div style={styles.previewDot} />
                <div style={styles.previewDot2} />
                <div style={styles.previewDot3} />
              </div>

              <div style={styles.previewBody}>
                <div style={styles.previewTitle}>Family Album</div>
                <div style={styles.previewSub}>
                  Only shared with people you approve.
                </div>

                <div style={styles.previewGrid}>
                  <div style={styles.previewTile} />
                  <div style={styles.previewTile} />
                  <div style={styles.previewTile} />
                  <div style={styles.previewTile} />
                  <div style={styles.previewTile} />
                  <div style={styles.previewTile} />
                </div>

                <div style={styles.previewFooter}>
                  <div style={styles.previewPill}>Private</div>
                  <div style={styles.previewPillSoft}>Shared</div>
                </div>
              </div>
            </div>

            <div style={styles.heroMiniCard}>
              <div style={styles.heroMiniTitle}>Storage meter</div>
              <div style={styles.heroMiniSub}>
                Always visible. No surprises.
              </div>

              <div style={styles.storageBar}>
                <div style={styles.storageFill} />
              </div>

              <div style={styles.storageText}>
                3.2 GB used <span style={styles.storageMuted}>of 10 GB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Built for privacy.</h2>
            <p style={styles.sectionSubtitle}>
              CertainShare is not social media. It’s private storage + sharing
              done the right way.
            </p>
          </div>

          <div style={styles.featureGrid}>
            <FeatureCard
              title="Private media vault"
              desc="Upload photos and videos to your own secure library. No weird algorithm feed deciding what matters."
            />
            <FeatureCard
              title="Friends + sharing controls"
              desc="Share albums with specific people. Block users. Keep your media private by default."
            />
            <FeatureCard
              title="Social-style feed (without the toxicity)"
              desc="See shared posts from people you trust, not strangers, not advertisers."
            />
            <FeatureCard
              title="Storage limits that make sense"
              desc="Free tier works like a real product. Upgrade only when you actually need more space."
            />
            <FeatureCard
              title="Backups included (paid tiers)"
              desc="Your memories deserve protection. CertainShare includes cold backups for peace of mind."
            />
            <FeatureCard
              title="No ads. No data selling."
              desc="We don’t monetize your personal life. We survive on subscriptions, not surveillance."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
<section style={styles.sectionAlt}>
  <div style={styles.sectionInner}>
    <div style={styles.sectionHeader}>
      <h2 style={styles.sectionTitle}>How it works</h2>
      <p style={styles.sectionSubtitle}>
        Simple workflow. Built for real people.
      </p>
    </div>

    <div style={styles.stepsGrid}>
      <StepCard
        step="01"
        title="Create your account"
        desc="Sign up in under a minute. No setup headaches."
      />
      <StepCard
        step="02"
        title="Upload your memories"
        desc="Upload photos and videos directly into your private vault."
      />
      <StepCard
        step="03"
        title="Share intentionally"
        desc="Choose who can access albums or posts. Control stays with you."
      />
      <StepCard
        step="04"
        title="Upgrade when you need it"
        desc="Stay free as long as possible. Pay only when storage becomes valuable."
      />
    </div>

    <div style={styles.feedExplainerCard}>
      <div style={styles.feedExplainerTitle}>How the feed works</div>
      <div style={styles.feedExplainerSub}>
        CertainShare doesn’t guess what you want to share. You decide.
      </div>

      <div style={styles.feedExplainerGrid}>
        <div style={styles.feedExplainerItem}>
          <div style={styles.feedExplainerLabelPublic}>Public Upload</div>
          <div style={styles.feedExplainerText}>
            If you upload as <b>Public</b>, <b>all of your friends</b> will see
            it in their feed.
          </div>
        </div>

        <div style={styles.feedExplainerItem}>
          <div style={styles.feedExplainerLabelPrivate}>Private Upload</div>
          <div style={styles.feedExplainerText}>
            If you upload as <b>Private</b>, <b>only you</b> can ever see it.
          </div>
        </div>

        <div style={styles.feedExplainerItem}>
          <div style={styles.feedExplainerLabelCustom}>Custom Share</div>
          <div style={styles.feedExplainerText}>
            If you share with <b>specific friends</b>, only those people will
            see it in their feed. Everyone else won’t even know it exists.
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* PRICING PREVIEW */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Pricing</h2>
            <p style={styles.sectionSubtitle}>
                CertainShare is not supported by ads. We don't track activity and we don't
  sell personal data. Paid plans directly fund secure servers, automatic
  backups, and continued development.
            </p>
          </div>

          <div style={styles.pricingGrid}>
            <PricingCard
              name="Free"
              price="$0"
              storage="1 GB"
              note="Great for trying it out."
              highlight={false}
            />

            <PricingCard
              name="Basic"
              price="$2.99/mo"
              storage="10 GB"
              note="Includes rolling cold backup + deep cold backup."
              highlight={false}
            />

            <PricingCard
              name="Pro"
              price="$6.99/mo"
              storage="100 GB"
              note="Best value. Add-on storage eligible."
              highlight={true}
            />

            <PricingCard
              name="Family"
              price="$17.99/mo"
              storage="400 GB"
              note="Built for families and shared albums."
              highlight={false}
            />
          </div>

          <div style={styles.pricingFooter}>
            Payments are handled securely through Stripe.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>Stop trusting your memories to ad-driven apps.</h2>
          <p style={styles.ctaSubtitle}>
            CertainShare is built for privacy, control, and peace of mind.
          </p>

          <div style={styles.ctaButtons}>
            {hasToken ? (
              <Link href="/mymedia" style={styles.primaryButton}>
                Go to My Media
              </Link>
            ) : (
              <>
                <Link href="/signup" style={styles.primaryButton}>
                  Create free account
                </Link>
                <Link href="/login" style={styles.secondaryButton}>
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerBrand}>
            <div style={styles.footerBrandTitle}>CertainShare</div>
            <div style={styles.footerBrandSub}>
              Private media storage and intentional sharing.
            </div>
          </div>

          <div style={styles.footerLinks}>
            <Link href="/settings/legal" style={styles.footerLink}>
              Terms
            </Link>
            <Link href="/settings/legal" style={styles.footerLink}>
              Privacy
            </Link>
            <Link href="/login" style={styles.footerLink}>
              Log in
            </Link>
            <Link href="/signup" style={styles.footerLink}>
              Sign up
            </Link>
          </div>
        </div>

        <div style={styles.footerBottom}>
          © {new Date().getFullYear()} CertainShare. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={styles.featureCard}>
      <div style={styles.featureTitle}>{title}</div>
      <div style={styles.featureDesc}>{desc}</div>
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div style={styles.stepCard}>
      <div style={styles.stepNum}>{step}</div>
      <div style={styles.stepTitle}>{title}</div>
      <div style={styles.stepDesc}>{desc}</div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  storage,
  note,
  highlight,
}: {
  name: string;
  price: string;
  storage: string;
  note: string;
  highlight: boolean;
}) {
  return (
    <div
      style={{
        ...styles.pricingCard,
        ...(highlight ? styles.pricingCardHighlight : {}),
      }}
    >
      {highlight && <div style={styles.bestValueBadge}>Best Value</div>}

      <div style={styles.pricingName}>{name}</div>
      <div style={styles.pricingPrice}>{price}</div>

      <div style={styles.pricingStorage}>
        Storage: <b>{storage}</b>
      </div>

      <div style={styles.pricingNote}>{note}</div>

      <Link
        href="/signup"
        style={{
          ...styles.pricingButton,
          ...(highlight ? styles.pricingButtonHighlight : {}),
        }}
      >
        Get {name}
      </Link>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "var(--bg)",
    minHeight: "100vh",
  },

  navWrapper: {
    position: "sticky",
    top: 0,
    zIndex: 999,
    background: "rgba(246,247,251,0.85)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid rgba(229,231,235,0.85)",
  },

  navInner: {
    maxWidth: 1150,
    margin: "0 auto",
    padding: "14px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  brandRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    fontWeight: 950,
    fontSize: 15,
    letterSpacing: "-0.4px",
    color: "var(--text)",
  },

  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 999,
    background: "linear-gradient(135deg, #2563eb, #4f46e5, #9333ea)",
    color: "white",
    fontWeight: 950,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: "-0.6px",
    boxShadow: "0px 14px 30px rgba(37,99,235,0.18)",
  },

  brandText: {
    fontWeight: 950,
    fontSize: 15,
  },

  navActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  navButton: {
    textDecoration: "none",
    fontWeight: 950,
    fontSize: 13,
    color: "var(--text)",
    background: "white",
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "var(--shadow-sm)",
  },

  navButtonPrimary: {
    textDecoration: "none",
    fontWeight: 950,
    fontSize: 13,
    color: "white",
    background: "#2563eb",
    border: "1px solid rgba(37,99,235,0.35)",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "0px 14px 28px rgba(37,99,235,0.18)",
  },

  heroSection: {
    paddingTop: 50,
    paddingBottom: 70,
  },

  heroInner: {
    maxWidth: 1150,
    margin: "0 auto",
    padding: "0px 20px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 30,
    alignItems: "center",
  },

  heroLeft: {},

  heroBadge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.18)",
    color: "#1d4ed8",
    fontWeight: 950,
    fontSize: 12,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },

  heroTitle: {
    marginTop: 16,
    marginBottom: 0,
    fontSize: 48,
    fontWeight: 950,
    letterSpacing: "-1.4px",
    lineHeight: "52px",
    color: "var(--text)",
  },

  heroSubtitle: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: "22px",
    maxWidth: 560,
  },

  heroButtons: {
    marginTop: 20,
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },

  primaryButton: {
    textDecoration: "none",
    fontWeight: 950,
    fontSize: 14,
    color: "white",
    background: "#2563eb",
    border: "1px solid rgba(37,99,235,0.45)",
    padding: "12px 16px",
    borderRadius: 14,
    boxShadow: "0px 18px 36px rgba(37,99,235,0.20)",
  },

  secondaryButton: {
    textDecoration: "none",
    fontWeight: 950,
    fontSize: 14,
    color: "var(--text)",
    background: "white",
    border: "1px solid rgba(15,23,42,0.12)",
    padding: "12px 16px",
    borderRadius: 14,
    boxShadow: "var(--shadow-sm)",
  },

  heroTrustRow: {
    marginTop: 28,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },

  trustItem: {
    background: "white",
    borderRadius: 18,
    padding: 14,
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "var(--shadow-sm)",
  },

  trustTitle: {
    fontWeight: 950,
    fontSize: 13,
    color: "var(--text)",
  },

  trustSub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: "16px",
  },

  heroRight: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  heroCard: {
    background: "white",
    borderRadius: 24,
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "0px 24px 70px rgba(0,0,0,0.10)",
    overflow: "hidden",
  },

  previewTop: {
    padding: 12,
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  previewDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#ef4444",
  },

  previewDot2: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#f59e0b",
  },

  previewDot3: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#22c55e",
  },

  previewBody: {
    padding: 16,
  },

  previewTitle: {
    fontWeight: 950,
    fontSize: 15,
    color: "var(--text)",
    letterSpacing: "-0.4px",
  },

  previewSub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 750,
    color: "var(--muted)",
  },

  previewGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },

  previewTile: {
    height: 64,
    borderRadius: 16,
    background: "linear-gradient(135deg, rgba(37,99,235,0.20), rgba(147,51,234,0.16))",
    border: "1px solid rgba(37,99,235,0.14)",
  },

  previewFooter: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  previewPill: {
    padding: "7px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 950,
    background: "rgba(15,23,42,0.06)",
    border: "1px solid rgba(15,23,42,0.10)",
    color: "var(--text)",
  },

  previewPillSoft: {
    padding: "7px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 950,
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.18)",
    color: "#1d4ed8",
  },

  heroMiniCard: {
    background: "white",
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.10)",
    padding: 16,
    boxShadow: "var(--shadow-md)",
  },

  heroMiniTitle: {
    fontWeight: 950,
    fontSize: 13,
    color: "var(--text)",
  },

  heroMiniSub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 750,
    color: "var(--muted)",
  },

  storageBar: {
    marginTop: 12,
    height: 12,
    borderRadius: 999,
    background: "rgba(15,23,42,0.06)",
    border: "1px solid rgba(15,23,42,0.08)",
    overflow: "hidden",
  },

  storageFill: {
    height: "100%",
    width: "45%",
    background: "linear-gradient(90deg, #2563eb, #4f46e5, #9333ea)",
    borderRadius: 999,
  },

  storageText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: 950,
    color: "var(--text)",
  },

  storageMuted: {
    color: "var(--muted)",
    fontWeight: 850,
  },

  section: {
    paddingTop: 60,
    paddingBottom: 60,
  },

  sectionAlt: {
    paddingTop: 60,
    paddingBottom: 60,
    background: "rgba(15,23,42,0.02)",
    borderTop: "1px solid rgba(15,23,42,0.06)",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
  },

  sectionInner: {
    maxWidth: 1150,
    margin: "0 auto",
    padding: "0px 20px",
  },

  sectionHeader: {
    marginBottom: 18,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 950,
    letterSpacing: "-0.8px",
    color: "var(--text)",
  },

  sectionSubtitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 750,
    color: "var(--muted)",
    maxWidth: 700,
    lineHeight: "20px",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
    marginTop: 18,
  },

  featureCard: {
    borderRadius: 22,
    padding: 16,
    background: "white",
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "var(--shadow-sm)",
  },

  featureTitle: {
    fontSize: 15,
    fontWeight: 950,
    color: "var(--text)",
    letterSpacing: "-0.4px",
  },

  featureDesc: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: "18px",
  },

  stepsGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },

  stepCard: {
    borderRadius: 22,
    padding: 16,
    background: "white",
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "var(--shadow-sm)",
  },

  stepNum: {
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: "0.8px",
    color: "#2563eb",
    textTransform: "uppercase",
  },

  stepTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: 950,
    color: "var(--text)",
    letterSpacing: "-0.4px",
  },

  stepDesc: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: "18px",
  },

  pricingGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },

  pricingCard: {
    borderRadius: 22,
    padding: 16,
    background: "white",
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "var(--shadow-md)",
    position: "relative",
    overflow: "hidden",
  },

  pricingCardHighlight: {
    border: "2px solid rgba(37,99,235,0.40)",
    boxShadow: "0px 18px 40px rgba(37,99,235,0.16)",
  },

  bestValueBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.20)",
    color: "#1d4ed8",
    fontWeight: 950,
    fontSize: 11,
    padding: "6px 10px",
    borderRadius: 999,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },

  pricingName: {
    fontSize: 16,
    fontWeight: 950,
    color: "var(--text)",
  },

  pricingPrice: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 900,
    color: "var(--muted)",
  },

  pricingStorage: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: 850,
    color: "var(--text)",
  },

  pricingNote: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: "18px",
  },

  pricingButton: {
    marginTop: 14,
    display: "block",
    textAlign: "center",
    textDecoration: "none",
    padding: "11px 12px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 13,
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.20)",
    color: "#1d4ed8",
  },

  pricingButtonHighlight: {
    background: "#2563eb",
    border: "1px solid rgba(37,99,235,0.45)",
    color: "white",
    boxShadow: "0px 16px 34px rgba(37,99,235,0.20)",
  },

  pricingFooter: {
    marginTop: 18,
    fontSize: 12,
    fontWeight: 750,
    color: "var(--muted2)",
    textAlign: "center",
  },

  ctaSection: {
    paddingTop: 70,
    paddingBottom: 70,
  },

  ctaInner: {
    maxWidth: 950,
    margin: "0 auto",
    padding: "30px 20px",
    borderRadius: 26,
    background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(147,51,234,0.10))",
    border: "1px solid rgba(37,99,235,0.14)",
    textAlign: "center",
    boxShadow: "var(--shadow-md)",
  },

  ctaTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 950,
    letterSpacing: "-0.8px",
    color: "var(--text)",
  },

  ctaSubtitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: 750,
    color: "var(--muted)",
    maxWidth: 650,
    marginLeft: "auto",
    marginRight: "auto",
    lineHeight: "20px",
  },

  ctaButtons: {
    marginTop: 18,
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  footer: {
    marginTop: 30,
    paddingTop: 40,
    paddingBottom: 30,
    borderTop: "1px solid rgba(15,23,42,0.08)",
  },

  footerInner: {
    maxWidth: 1150,
    margin: "0 auto",
    padding: "0px 20px",
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },

  footerBrand: {
    maxWidth: 360,
  },

  footerBrandTitle: {
    fontWeight: 950,
    fontSize: 14,
    color: "var(--text)",
  },

  footerBrandSub: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: "16px",
  },

  footerLinks: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  footerLink: {
    fontSize: 12,
    fontWeight: 950,
    color: "var(--text)",
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "white",
  },

  footerBottom: {
    marginTop: 22,
    textAlign: "center",
    fontSize: 12,
    fontWeight: 750,
    color: "var(--muted2)",
  },
    feedExplainerCard: {
    marginTop: 18,
    borderRadius: 22,
    padding: 18,
    background: "white",
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "var(--shadow-sm)",
  },

  feedExplainerTitle: {
    fontSize: 16,
    fontWeight: 950,
    color: "var(--text)",
    letterSpacing: "-0.4px",
  },

  feedExplainerSub: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: "18px",
  },

  feedExplainerGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },

  feedExplainerItem: {
    borderRadius: 18,
    padding: 14,
    background: "rgba(15,23,42,0.02)",
    border: "1px solid rgba(15,23,42,0.08)",
  },

  feedExplainerText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: 750,
    color: "var(--muted)",
    lineHeight: "18px",
  },

  feedExplainerLabelPublic: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    background: "rgba(37,99,235,0.10)",
    border: "1px solid rgba(37,99,235,0.18)",
    color: "#1d4ed8",
  },

  feedExplainerLabelPrivate: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    background: "rgba(15,23,42,0.06)",
    border: "1px solid rgba(15,23,42,0.12)",
    color: "var(--text)",
  },

  feedExplainerLabelCustom: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    background: "rgba(147,51,234,0.10)",
    border: "1px solid rgba(147,51,234,0.18)",
    color: "#7e22ce",
  },
};