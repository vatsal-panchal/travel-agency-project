import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Headphones,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { enquiryApi } from '../api/enquiryApi';
import { Reveal } from '../components/ui/Reveal';

const contactDetails = [
  {
    icon: MapPin,
    label: 'The studio',
    value: 'Wanderlust House, Connaught Place, New Delhi 110001',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'concierge@wanderlust.agency',
    href: 'mailto:concierge@wanderlust.agency',
  },
  {
    icon: Phone,
    label: 'Concierge line',
    value: '+91 11 4982 3000',
    href: 'tel:+911149823000',
  },
  {
    icon: Clock3,
    label: 'Studio hours',
    value: 'Mon–Sat, 9am–9pm IST. On-trip support is 24/7.',
  },
];

export const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    try {
      setLoading(true);
      await enquiryApi.submit(form);
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'We could not send your message just now. Please try again in a moment.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-clip">
      {/* Header */}
      <section className="border-b border-ink/10 bg-cream-200/40">
        <div className="container-x grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <Reveal>
            <span className="eyebrow">The concierge desk</span>
            <h1 className="display-hero mt-5 max-w-3xl text-[3rem] text-ink sm:text-[4.4rem]">
              Tell us where you want to{' '}
              <em className="font-light italic text-clay-500">wake up next.</em>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-[1.85] text-ink-500">
              Private itineraries, odd requests, honeymoons with a tiny guest in tow — this is
              where they start. A specialist reads every note and replies personally.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-[2rem] border border-ink/10 bg-cream-50 p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest text-cream-50">
                  <Headphones className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-clay-600">
                    Average reply
                  </p>
                  <p className="font-display text-2xl leading-tight text-ink">Under 4 hours</p>
                </div>
              </div>
              <p className="mt-4 text-[12.5px] leading-relaxed text-ink-500">
                During IST business hours. Urgent on-trip issues are forwarded straight to the
                duty specialist, day or night.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip">
                  <ShieldCheck className="h-3.5 w-3.5 text-moss" /> No obligation
                </span>
                <span className="chip">
                  <Sparkles className="h-3.5 w-3.5 text-clay-500" /> Human reply
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-x py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          {/* Details */}
          <Reveal>
            <div className="space-y-7">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-ink-400">
                  Reach us directly
                </span>
                <div className="mt-4 space-y-5">
                  {contactDetails.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-start gap-3.5">
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/10 bg-cream-50 text-clay-600">
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-400">
                            {item.label}
                          </p>
                          {item.href ? (
                            <a
                              href={item.href}
                              className="mt-0.5 block text-[13.5px] font-semibold leading-relaxed text-ink transition hover:text-clay-600"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="mt-0.5 text-[13.5px] font-semibold leading-relaxed text-ink-600">
                              {item.value}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-forest-deep p-6 text-cream-100">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cream-100/10 text-clay-300">
                  <Phone className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-display text-2xl leading-tight text-cream-50">
                  Speak with a travel specialist
                </h2>
                <p className="mt-2 text-[12.5px] leading-relaxed text-cream-200/65">
                  Call our concierge line during studio hours for help with journeys, dates and
                  bookings. You can also send an enquiry and our team will get back to you.
                </p>
                <a href="tel:+911149823000" className="btn-light btn-sm mt-5">
                  Call the concierge <Phone className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={90}>
            <div className="card-surface p-6 sm:p-8 lg:p-10">
              {success ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-moss/10 text-moss">
                    <CheckCircle2 className="h-8 w-8" strokeWidth={1.6} />
                  </span>
                  <span className="eyebrow mt-6">Message received</span>
                  <h2 className="mt-3 max-w-sm font-display text-3xl leading-tight text-ink">
                    Consider it in good hands.
                  </h2>
                  <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-ink-500">
                    A destination specialist will reply within one business day. If your trip is
                    imminent, call the concierge line and mention this request.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="btn-outline btn-sm mt-7"
                  >
                    Send another note
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="font-display text-3xl leading-tight text-ink">
                        Start a conversation
                      </h2>
                      <p className="mt-1 text-[12.5px] text-ink-400">
                        A few details are enough to begin.
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-300">
                      Fields marked *
                    </span>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700"
                    >
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="contact-name" className="field-label">
                          Your name *
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          autoComplete="name"
                          value={form.name}
                          onChange={handleChange('name')}
                          placeholder="Alex Morgan"
                          className="field-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="field-label">
                          Email *
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={form.email}
                          onChange={handleChange('email')}
                          placeholder="alex@example.com"
                          className="field-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="field-label">
                        Phone <span className="normal-case tracking-normal text-ink-300">(optional)</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleChange('phone')}
                        placeholder="+91 98765 43210"
                        className="field-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="field-label">
                        Where are you thinking? *
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange('message')}
                        placeholder="A rough window, who is travelling, and the feeling you are after. We will take it from there."
                        className="field-input resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-[260px] text-[10.5px] leading-relaxed text-ink-400">
                        We use your details only to reply to this enquiry. No lists, no sales calls.
                      </p>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-ink w-full shrink-0 sm:w-auto"
                      >
                        {loading ? (
                          'Sending…'
                        ) : (
                          <>
                            Send enquiry <Send className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};
