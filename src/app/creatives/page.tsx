import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Reveal from "@/components/animations/Reveal";
import CreativesClient from "@/components/creatives/CreativesClient";

export const metadata: Metadata = {
  title: "Creative work",
  description:
    "Visual designs, flyers, and video creatives crafted by Neba Precious Ngeh.",
  alternates: {
    canonical: "/creatives",
  },
};

export default function CreativesPage() {
  return (
    <>
      <Navbar />

      <main className="creatives-page">
        <section className="section">
          <div className="container">
            <Reveal>
              <div className="section-heading creative-page-heading">
                <div>
                  <p className="section-label">Creative</p>
                  <h1 className="page-title">
                    Work beyond <span className="accent-word">code</span>
                  </h1>
                </div>

                <p className="page-intro">
                  Visual designs and edited video pieces, collected in one place.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <CreativesClient />
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}