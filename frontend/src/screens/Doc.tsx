// src/screens/Doc.tsx
import { motion } from "framer-motion";
import React from "react";

// tweak this to speed up/slow down the cascade
const STEP_SECONDS = 0.5;

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay },
  },
});

const Section: React.FC<{
  title: string;
  delay?: number;
  children: React.ReactNode;
}> = ({ title, delay = 0, children }) => (
  <motion.section
    className="rounded-2xl border bg-white p-6 shadow-sm"
    variants={fadeUp(delay)}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.2 }}
  >
    <h2 className="text-xl font-semibold mb-3">{title}</h2>
    <div className="prose prose-sm max-w-none">{children}</div>
  </motion.section>
);

export default function Doc() {
  // convenience to compute sequential delays
  const d = (i: number) => i * STEP_SECONDS;

  return (
    <div className="px-8 py-10 max-w-6xl mx-auto space-y-8">
      {/* Hero (appears immediately) */}
      <motion.div
        variants={fadeUp(0)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex items-start gap-4"
      >
        <div className="inline-grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white text-xl font-bold shadow-sm">
          ₹
        </div>
        <div>
          <h1 className="text-3xl font-bold">Pricing Intel — Project Doc</h1>
          <p className="text-gray-600 mt-1">
            A small system that generates daily price recommendations for
            short-stay listings and visualizes them with confidence bands.
          </p>
        </div>
      </motion.div>

      <Section title="What this project does" delay={d(1)}>
        <ul>
          <li>
            Stores listings (city, rooms, etc.) and market signals{" "}
            <em>(MarketSample, FeaturesDaily)</em>.
          </li>
          <li>
            Computes a recommended price per listing/day with a lightweight
            baseline model (weekend uplift, event score, occupancy).
          </li>
          <li>
            Pre-generates the next 30 days for all listings (Celery task) and
            supports on-demand generation for any custom range per listing.
          </li>
          <li>
            Frontend shows price curves with confidence bands and a multi-listing
            compare view.
          </li>
        </ul>
      </Section>

      <Section title="Tech stack" delay={d(2)}>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-1">Frontend</h3>
            <ul>
              <li>React + TypeScript + Vite</li>
              <li>Tailwind CSS</li>
              <li>Recharts (charts)</li>
              <li>Framer Motion (animations)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">Backend</h3>
            <ul>
              <li>Django + DRF</li>
              <li>Celery (async/scheduled jobs)</li>
              <li>PostgreSQL</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">Infra</h3>
            <ul>
              <li>Docker Compose</li>
              <li>Nginx</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="How recommendations are generated" delay={d(3)}>
        <ol>
          <li>
            <strong>Inputs:</strong> MarketSample (price, occupancy) + optional
            FeaturesDaily (event_score) by city/date.
          </li>
          <li>
            <strong>Model:</strong>{" "}
            <code>_baseline_price(ms_price, occupancy, event_score, dow, rooms)</code>{" "}
            → room multiplier, occupancy factor, weekend uplift, event lift; cap
            between ₹1000 and 2× market price.
          </li>
          <li>
            <strong>30-day scheduler:</strong>{" "}
            <code>generate_recommendations(days_ahead=30)</code> refreshes recs
            for all listings.
          </li>
          <li>
            <strong>Live (custom range):</strong>{" "}
            <code>
              GET /api/listings/&lt;id&gt;/recommendations/?from=YYYY-MM-DD&amp;to=YYYY-MM-DD
            </code>{" "}
            fills missing days for that listing synchronously and returns the
            data.
          </li>
        </ol>
      </Section>

      <Section title="Key API endpoints" delay={d(4)}>
        <ul>
          <li>
            <code>GET /api/listings/</code> — list all listings
          </li>
          <li>
            <code>GET /api/listings/&lt;id&gt;/</code> — single listing
          </li>
          <li>
            <code>
              GET /api/listings/&lt;id&gt;/recommendations/?from=YYYY-MM-DD&amp;to=YYYY-MM-DD
            </code>{" "}
            — date-ranged recs (live fill if needed)
          </li>
        </ul>
      </Section>

      <Section title="Frontend ↔ Backend data flow" delay={d(5)}>
        <ol>
          <li>
            UI reads <code>VITE_API_BASE</code> (defaults to <code>/api</code>).
          </li>
          <li>
            Listing detail graph updates only after “Get live recommendation”.
          </li>
          <li>
            Compare overlays up to 5 listings and renders individual mini
            charts; hides any with no data.
          </li>
        </ol>
      </Section>

      <Section title="Running locally (quick)" delay={d(6)}>
        <pre className="whitespace-pre-wrap">
{`# backend
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py shell -c "from apps.recommendations.tasks import generate_recommendations; print(generate_recommendations.run(days_ahead=30))"

# frontend
docker compose exec frontend npm run dev   # or: npm run build`}
        </pre>
      </Section>
    </div>
  );
}
