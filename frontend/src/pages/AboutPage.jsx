import React from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Award,
  Compass,
  Globe2,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Reveal } from '../components/ui/Reveal';
import { SectionHeading } from '../components/ui/SectionHeading';

const principles = [
  {
    icon: ShieldCheck,
    title: 'Booked once, held properly',
    copy: 'Seats are locked atomically the moment you reserve, so the journey you choose is the journey you get. No double bookings, no quiet cancellations.',
  },
  {
    icon: Award,
    title: 'Reviewed by people who went',
    copy: 'Only travellers with a paid, completed booking can leave a review. We publish them unedited — the good, the great and the honest.',
  },
  {
    icon: Globe2,
    title: 'Local hands on the ground',
    copy: 'Every itinerary is built with certified local guides, family-run stays and operators who know the weather, the roads and the quiet hours.',
  },
  {
    icon: Leaf,
    title: 'Small groups by design',
    copy: 'We cap most departures at twelve guests. Fewer people means lighter footprints, better access and room for the unexpected.',
  },
];

const milestones = [
  { year: '2014', title: 'A notebook and a one-way ticket', copy: 'Wanderlust began as a shared travel journal between three friends in New Delhi.' },
  { year: '2018', title: 'The first atelier', copy: 'We opened a small studio and began designing private itineraries with local partners.' },
  { year: '2022', title: 'A slower kind of growth', copy: 'We stopped chasing volume and started capping departures by what a place can comfortably hold.' },
  { year: 'Today', title: 'Forty journeys, one standard', copy: 'A tightly edited collection across five continents — each one travelled and vetted by our team.' },
];

export const AboutPage = () => {
  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative border-b border-ink/10 bg-cream-200/40">
        <div className="container-x grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <span className="eyebrow">The travel atelier</span>
            <h1 className="display-hero mt-5 max-w-2xl text-[3rem] text-ink sm:text-[4.4rem]">
              We design journeys for people who{' '}
              <em className="font-light italic text-clay-500">travel to feel.</em>
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-[1.85] text-ink-500">
              Wanderlust is a small, independent travel studio. We plan fewer trips, in more
              detail, with the people who actually live there. The result is travel that feels
              less like a package and more like a story you happened to be part of.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/packages" className="btn-ink">
                Explore the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="btn-outline">
                Talk to a specialist
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="relative ml-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.5rem] bg-cream-300 shadow-lift">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1100&q=85"
                alt="Travellers on a quiet mountain road at golden hour"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-ink/35 px-5 py-4 text-cream-50 backdrop-blur-md">
                <p className="font-display text-2xl leading-tight">Since 2014</p>
                <p className="mt-1 text-[11px] font-semibold text-cream-100/75">
                  Independently owned. Deliberately small.
                </p>
              </div>
            </div>
            <div className="absolute -left-4 top-8 hidden rounded-2xl border border-ink/10 bg-cream-50 px-4 py-3 shadow-card sm:block">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-clay-500" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-500">
                  38 countries mapped
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section className="container-x py-16 sm:py-24">
        <SectionHeading
          eyebrow="What we hold to"
          title="A quieter, more careful way to travel."
          description="These are not brand promises. They are the operating rules our team works to, every day."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {principles.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 70}>
                <article className="card-surface group h-full p-7 transition duration-500 hover:-translate-y-1 hover:shadow-card">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest text-cream-50 transition group-hover:bg-clay-500">
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <h2 className="mt-5 font-display text-2xl leading-tight text-ink">{item.title}</h2>
                  <p className="mt-2.5 text-[13.5px] leading-[1.8] text-ink-500">{item.copy}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Story timeline */}
      <section className="border-y border-ink/10 bg-forest-deep py-16 text-cream-100 sm:py-24">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal>
              <span className="eyebrow eyebrow-light">How we got here</span>
              <h2 className="mt-4 max-w-md font-display text-4xl leading-[1.08] text-cream-50 sm:text-5xl">
                Built slowly, on purpose.
              </h2>
              <p className="mt-5 max-w-md text-[14px] leading-[1.85] text-cream-200/65">
                We have never taken outside investment, which means we can say no to trips that
                do not meet the standard — and keep the people who plan them close to the people
                who take them.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-cream-100/10 bg-cream-100/[0.05] px-4 py-3">
                  <p className="font-display text-2xl text-cream-50">12</p>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-cream-200/50">
                    Max group size
                  </p>
                </div>
                <div className="rounded-2xl border border-cream-100/10 bg-cream-100/[0.05] px-4 py-3">
                  <p className="font-display text-2xl text-cream-50">5</p>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-cream-200/50">
                    Continents
                  </p>
                </div>
                <div className="rounded-2xl border border-cream-100/10 bg-cream-100/[0.05] px-4 py-3">
                  <p className="font-display text-2xl text-cream-50">1</p>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-cream-200/50">
                    Standard
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="relative">
              <div className="absolute bottom-2 left-[7px] top-2 w-px bg-cream-100/15" />
              <div className="space-y-8">
                {milestones.map((item, index) => (
                  <Reveal key={item.year} delay={index * 80}>
                    <div className="relative pl-8">
                      <span className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-forest-deep bg-clay-500 ring-1 ring-cream-100/20" />
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-clay-300">
                        {item.year}
                      </span>
                      <h3 className="mt-1.5 font-display text-xl text-cream-50">{item.title}</h3>
                      <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-cream-200/60">
                        {item.copy}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team note + CTA */}
      <section className="container-x py-16 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-cream-300 shadow-card">
              <img
                src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1100&q=85"
                alt="A local guide leading travellers through a mountain village"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={100} className="order-1 lg:order-2">
            <span className="eyebrow">A note from the studio</span>
            <blockquote className="mt-5 font-display text-3xl leading-[1.2] text-ink sm:text-4xl">
              “The best trips are not the most expensive ones. They are the ones that leave you
              with a story you keep telling.”
            </blockquote>
            <div className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-5">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-forest text-sm font-extrabold text-cream-50">
                AS
              </span>
              <div>
                <p className="text-sm font-extrabold text-ink">Ananya Sharma</p>
                <p className="text-[11px] font-semibold text-ink-400">Founder & lead designer</p>
              </div>
            </div>
            <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-ink-500">
              If you have a place in mind — or only a feeling — write to us. We will tell you
              honestly whether we are the right studio for it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-clay">
                Start a conversation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/reviews" className="btn-outline">
                Read traveller notes
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust strip */}
      <section className="container-x pb-20">
        <Reveal>
          <div className="flex flex-col items-center justify-between gap-5 rounded-[2rem] bg-forest px-7 py-7 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream-100/10 text-clay-300">
                <HeartHandshake className="h-6 w-6" strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-cream-200/50">
                  Human help, always
                </p>
                <h2 className="mt-1 font-display text-2xl text-cream-50">
                  A real specialist, not a chatbot queue.
                </h2>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden items-center gap-1.5 text-[11px] font-bold text-cream-200/60 sm:flex">
                <Users className="h-4 w-4 text-clay-300" /> 24/7 on the road
              </span>
              <Link to="/contact" className="btn-light btn-sm">
                Contact us <Sparkles className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
