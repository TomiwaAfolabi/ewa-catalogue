<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <!-- ── NAV already in layout, this is page content ── -->

  <!-- ── HERO ─────────────────────────────────────────────────────────────── -->
  <section class="hero">
    <div class="hero-left">
      <div class="rebrand-badge">✦ A New Chapter Begins</div>
      <h1 class="hero-headline">
        Where <em>Heritage</em><br />Meets<br />the Modern<br />Man
      </h1>
      <p class="hero-sub">African beauty, reimagined</p>
      <p class="hero-body">
        <strong>Ewa</strong> is not just clothing — it is a celebration.
        Of the craftsmen who came before us, and the men we are becoming.
        Every thread carries a story.
      </p>
      <div class="hero-ctas">
        <button class="btn-primary" @click="router.push({ name: 'catalogue' })">
          Discover Ewa
        </button>
        <button class="btn-ghost" @click="router.push({ name: 'catalogue' })">
          Shop the Collection ↓
        </button>
      </div>
    </div>

    <div class="hero-right">
      <div class="hero-fabric-bg" />
      <div class="hero-center-art">
        <svg class="lily-emblem" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C"/>
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C" transform="rotate(60 140 140)"/>
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C" transform="rotate(120 140 140)"/>
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C" transform="rotate(180 140 140)"/>
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C" transform="rotate(240 140 140)"/>
          <ellipse cx="140" cy="80" rx="18" ry="52" fill="#C9A84C" transform="rotate(300 140 140)"/>
          <circle cx="140" cy="140" r="24" fill="#B5522A"/>
          <circle cx="140" cy="140" r="14" fill="#C9A84C"/>
          <circle cx="140" cy="140" r="110" stroke="#C9A84C" stroke-width="1" stroke-dasharray="4 6" fill="none"/>
        </svg>
      </div>
      <div class="hero-quote">
        <p class="hero-quote-text">"He carries culture in his walk<br />and confidence in his cloth."</p>
        <span class="hero-quote-attr">✦ The Ewa Man</span>
      </div>
    </div>
  </section>

  <!-- ── MARQUEE ───────────────────────────────────────────────────────────── -->
  <div class="marquee-bar" aria-hidden="true">
    <div class="marquee-track">
      <div class="marquee-inner">
        <span>Culture</span><span class="dot">✦</span>
        <span>Heritage</span><span class="dot">✦</span>
        <span>Elegance</span><span class="dot">✦</span>
        <span>Craftsmanship</span><span class="dot">✦</span>
        <span>Individuality</span><span class="dot">✦</span>
        <span>Ewa · Yoruba for Beauty</span><span class="dot">✦</span>
        <span>Culture</span><span class="dot">✦</span>
        <span>Heritage</span><span class="dot">✦</span>
        <span>Elegance</span><span class="dot">✦</span>
        <span>Craftsmanship</span><span class="dot">✦</span>
        <span>Individuality</span><span class="dot">✦</span>
        <span>Ewa · Yoruba for Beauty</span><span class="dot">✦</span>
      </div>
    </div>
  </div>

  <!-- ── STORY ─────────────────────────────────────────────────────────────── -->
  <section class="section-story">
    <div class="section-label">Our Story</div>
    <div class="story-content">
      <h2>Born from passion.<br /><em>Built for belonging.</em></h2>
      <p>
        Ewa was born out of a deep longing — to see African beauty reflected
        back in clothing that feels both ancient and completely now. Inspired
        by the richness of heritage fabrics, the dignity of our grandmothers,
        and the fearlessness of today's generation.
      </p>
      <p>
        Every piece we create is an act of storytelling. A celebration of
        self-expression, of grace, of individuality. We don't just make
        clothes — we create languages for people to speak in.
      </p>
      <div class="story-divider" />
      <div class="yoruba-meaning">
        <span class="yoruba-word">Ewa.</span>
        <span class="yoruba-def">Yoruba (n.) — Beauty. The kind that is felt as much as seen.</span>
      </div>
    </div>
  </section>

  <!-- ── PILLARS ───────────────────────────────────────────────────────────── -->
  <section class="section-pillars">
    <div class="pillars-header">
      <div class="section-label" style="text-align:center;">Our Promise</div>
      <h2>What we stand for</h2>
    </div>
    <div class="pillars-grid">
      <div class="pillar">
        <svg class="pillar-icon" viewBox="0 0 40 40" fill="none">
          <path d="M20 4 C20 4 28 12 28 20 C28 28 20 36 20 36 C20 36 12 28 12 20 C12 12 20 4 20 4Z" stroke="#C9A84C" stroke-width="1" fill="rgba(201,168,76,0.1)"/>
          <circle cx="20" cy="20" r="4" fill="#C9A84C"/>
        </svg>
        <h3 class="pillar-title">Redefine African Fashion</h3>
        <p class="pillar-text">Bringing African-inspired design into the contemporary market — not as costume, but as culture in motion.</p>
      </div>
      <div class="pillar">
        <svg class="pillar-icon" viewBox="0 0 40 40" fill="none">
          <rect x="8" y="8" width="24" height="24" stroke="#B5522A" stroke-width="1" fill="rgba(181,82,42,0.1)"/>
          <line x1="8" y1="20" x2="32" y2="20" stroke="#B5522A" stroke-width="0.5"/>
          <line x1="20" y1="8" x2="20" y2="32" stroke="#B5522A" stroke-width="0.5"/>
        </svg>
        <h3 class="pillar-title">Make Culture Wearable</h3>
        <p class="pillar-text">Culturally inspired clothing that is accessible, everyday, and deeply empowering for every man.</p>
      </div>
      <div class="pillar">
        <svg class="pillar-icon" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" stroke="#5C6040" stroke-width="1" fill="rgba(92,96,64,0.1)"/>
          <circle cx="20" cy="20" r="6" fill="#5C6040" opacity="0.5"/>
          <path d="M20 6 L20 34 M6 20 L34 20" stroke="#5C6040" stroke-width="0.5"/>
        </svg>
        <h3 class="pillar-title">Build a Community</h3>
        <p class="pillar-text">A gathering of people who celebrate individuality, honour their roots, and lift each other.</p>
      </div>
    </div>
  </section>

  <!-- ── CTA ───────────────────────────────────────────────────────────────── -->
  <section class="section-cta">
    <div class="cta-inner">
      <div class="section-label" style="text-align:center; margin-bottom:16px;">The Collection</div>
      <h2 class="cta-headline">Ready to wear your heritage?</h2>
      <p class="cta-body">Explore the full catalogue of linen pieces crafted for the modern African man.</p>
      <button class="btn-primary" @click="router.push({ name: 'catalogue' })">
        Shop Now ↗
      </button>
    </div>
  </section>
</template>

<style scoped>
/* ── Hero ────────────────────────────────────────────────────────────────── */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 72px);
}

.hero-left {
  padding: 80px 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  background: rgba(28, 19, 16, 0.72);
}

.hero-left::after {
  content: '';
  position: absolute;
  right: 0; top: 10%; bottom: 10%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, var(--terra-light), transparent);
}

.rebrand-badge {
  display: inline-block;
  font-size: 10px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--gold);
  border: 1px solid rgba(201, 168, 76, 0.35);
  padding: 6px 16px;
  margin-bottom: 36px;
  width: fit-content;
  font-weight: 400;
}

.hero-headline {
  font-family: var(--font-serif);
  font-size: clamp(48px, 5.5vw, 80px);
  font-weight: 300;
  line-height: 1.0;
  color: var(--ivory);
  margin-bottom: 16px;
}
.hero-headline em { font-style: italic; color: var(--terra); }

.hero-sub {
  font-size: 12px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 300;
  margin-bottom: 28px;
}

.hero-body {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(250, 246, 239, 0.72);
  max-width: 400px;
  margin-bottom: 48px;
  font-weight: 300;
}
.hero-body strong { color: var(--terra); font-weight: 400; }

.hero-ctas {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}

.hero-right {
  position: relative;
  background: var(--terra-pale);
  overflow: hidden;
}

.hero-fabric-bg {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(201,168,76,0.06) 30px, rgba(201,168,76,0.06) 31px),
    repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(181,82,42,0.04) 30px, rgba(181,82,42,0.04) 31px);
}

.hero-center-art {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lily-emblem {
  width: 300px;
  height: 300px;
  opacity: 0.2;
  animation: slowSpin 60s linear infinite;
}

@keyframes slowSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.hero-quote {
  position: absolute;
  bottom: 60px;
  left: 48px;
  right: 48px;
}

.hero-quote-text {
  font-family: var(--font-serif);
  font-size: 22px;
  font-style: italic;
  font-weight: 300;
  color: var(--ink-soft);
  line-height: 1.5;
  margin-bottom: 12px;
}

.hero-quote-attr {
  font-size: 10px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--gold);
}

/* ── Marquee ──────────────────────────────────────────────────────────────── */
.marquee-bar {
  background: var(--ink);
  padding: 16px 0;
  overflow: hidden;
}

.marquee-track { overflow: hidden; white-space: nowrap; }

.marquee-inner {
  display: inline-block;
  animation: marquee 24s linear infinite;
}

.marquee-inner span {
  font-size: 11px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--gold-light);
  font-weight: 300;
  margin: 0 24px;
}

.marquee-inner .dot {
  color: var(--terra);
  margin: 0;
}

/* ── Story ────────────────────────────────────────────────────────────────── */
.section-story {
  padding: 100px 10% 100px;
  max-width: 900px;
  margin: 0 auto;
  background: rgba(28, 19, 16, 0.75);
}

.story-content h2 {
  font-family: var(--font-serif);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 300;
  color: var(--ivory);
  margin-bottom: 32px;
  line-height: 1.1;
}
.story-content h2 em { font-style: italic; color: var(--terra); }

.story-content p {
  font-size: 16px;
  line-height: 1.9;
  color: rgba(250, 246, 239, 0.65);
  font-weight: 300;
  margin-bottom: 20px;
}

.story-divider {
  width: 80px;
  height: 1px;
  background: linear-gradient(to right, var(--terra), transparent);
  margin: 40px 0;
}

.yoruba-meaning {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.yoruba-word {
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: 300;
  font-style: italic;
  color: var(--gold);
}

.yoruba-def {
  font-size: 13px;
  letter-spacing: 0.1em;
  color: var(--muted);
  font-weight: 300;
}

/* ── Pillars ───────────────────────────────────────────────────────────────── */
.section-pillars {
  padding: 100px 64px;
  background: rgba(28, 19, 16, 0.6);
}

.pillars-header {
  text-align: center;
  margin-bottom: 64px;
}

.pillars-header h2 {
  font-family: var(--font-serif);
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 300;
  color: var(--ivory);
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  max-width: 1200px;
  margin: 0 auto;
}

.pillar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 40px 32px;
  border: 1px solid rgba(201, 168, 76, 0.15);
  border-radius: var(--radius-sm);
  background: rgba(250, 246, 239, 0.03);
  transition: border-color var(--transition-base), background var(--transition-base);
}
.pillar:hover {
  border-color: rgba(201, 168, 76, 0.35);
  background: rgba(250, 246, 239, 0.06);
}

.pillar-icon { width: 40px; height: 40px; }

.pillar-title {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 300;
  color: var(--ivory);
}

.pillar-text {
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted);
  font-weight: 300;
}

/* ── CTA ───────────────────────────────────────────────────────────────────── */
.section-cta {
  padding: 120px 64px;
  background: rgba(61, 32, 53, 0.65);
  text-align: center;
}

.cta-inner {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.cta-headline {
  font-family: var(--font-serif);
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 300;
  color: var(--ivory);
}

.cta-body {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(250, 246, 239, 0.6);
  font-weight: 300;
}

/* ── Responsive ────────────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .pillars-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .hero { grid-template-columns: 1fr; }
  .hero-left { padding: 60px 24px; }
  .hero-left::after { display: none; }
  .hero-right { min-height: 300px; }
  .section-story { padding: 60px 24px; }
  .section-pillars { padding: 60px 24px; }
  .section-cta { padding: 80px 24px; }
}
</style>
