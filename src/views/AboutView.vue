<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="about-page">
    <section class="about-panel" aria-labelledby="about-heading">
      <div class="about-inner">
        <p class="section-label">About us</p>
        <h1 id="about-heading" class="about-title">
          Born from passion.<br /><em>Built for belonging.</em>
        </h1>
        <p class="about-body">
          Ewa was born out of a deep longing — to see African beauty reflected
          back in clothing that feels both ancient and completely now. Inspired
          by the richness of heritage fabrics, the dignity of our grandmothers,
          and the fearlessness of today's generation.
        </p>
        <p class="about-body">
          Every piece we create is an act of storytelling. A celebration of
          self-expression, of grace, of individuality. We don't just make
          clothes — we create languages for people to speak in.
        </p>
        <div class="about-divider" aria-hidden="true" />
        <div class="about-yoruba">
          <span class="about-yoruba-word">Ewa.</span>
          <span class="about-yoruba-def">
            Yoruba (n.) — Beauty. The kind that is felt as much as seen.
          </span>
        </div>
        <div class="about-actions">
          <button type="button" class="btn-primary" @click="router.push({ name: 'catalogue' })">
            Shop the collection
          </button>
          <button type="button" class="btn-ghost" @click="router.push({ name: 'home' })">
            ← Back to home
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.about-page {
  min-height: calc(100vh - 72px);
  background: rgba(28, 19, 16, 0.72);
  padding: 48px 24px 80px;
}

.about-panel {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(28, 19, 16, 0.75);
  border-radius: var(--radius-md);
  border: 1px solid rgba(201, 168, 76, 0.12);
  padding: clamp(48px, 8vw, 100px) clamp(24px, 8vw, 10%);
}

.about-inner .section-label {
  margin-bottom: 20px;
}

.about-title {
  font-family: var(--font-serif);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 300;
  color: var(--ivory);
  margin-bottom: 32px;
  line-height: 1.1;
}

.about-title em {
  font-style: italic;
  color: var(--terra);
}

.about-body {
  font-size: 17px;
  line-height: 1.8;
  color: rgba(250, 246, 239, 0.82);
  font-weight: 400;
  margin-bottom: 20px;
}

.about-divider {
  width: 80px;
  height: 1px;
  background: linear-gradient(to right, var(--terra), transparent);
  margin: 40px 0;
}

.about-yoruba {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 40px;
}

.about-yoruba-word {
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: 300;
  font-style: italic;
  color: var(--gold);
}

.about-yoruba-def {
  font-size: 13px;
  letter-spacing: 0.1em;
  color: var(--muted);
  font-weight: 300;
}

.about-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 28px;
}
</style>
