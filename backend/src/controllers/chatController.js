import { Groq } from 'groq-sdk';
import { Package } from '../models/Package.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { env } from '../config/env.js';

export const handleChat = catchAsync(async (req, res, next) => {
  if (!env.GROQ_API_KEY || env.GROQ_API_KEY.trim() === '') {
    throw new ApiError(
      503,
      'AI support service is currently unavailable. Please configure GROQ_API_KEY.',
      null,
      'SERVICE_UNAVAILABLE'
    );
  }

  const { message, history } = req.body;

  // Grounding: extract simple keywords to retrieve up to 5 relevant active packages from DB
  const keywords = message
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 5);

  let searchFilter = { isActive: true };
  if (keywords.length > 0) {
    const regexPattern = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    searchFilter.$or = [
      { title: new RegExp(regexPattern, 'i') },
      { destination: new RegExp(regexPattern, 'i') },
      { category: new RegExp(regexPattern, 'i') },
    ];
  }

  const relevantPackages = await Package.find(searchFilter)
    .select('title destination price durationDays category availableSeats cancellationPolicy')
    .limit(5);

  const packagesContext = relevantPackages.map((p) => ({
    title: p.title,
    destination: p.destination,
    category: p.category,
    price: `$${p.price}`,
    duration: `${p.durationDays} days`,
    seatsLeft: p.availableSeats,
    cancellation: p.cancellationPolicy,
  }));

  const systemPrompt = `You are a professional, helpful customer support assistant for "Wanderlust Travel Agency".
Your capabilities and strict constraints:
1. You answer queries ONLY regarding our travel packages, bookings, payments, cancellations, and website usage.
2. Politely refuse and decline any questions or topics unrelated to our travel agency.
3. Ground your answers using the official travel packages listed below. NEVER invent or hallucinate package names, destinations, or prices not in the official catalog.
4. Booking rules: Bookings are held for 15 minutes before requiring payment. Cancellations are permitted anytime before the trip start date for a full refund.
5. If the user asks about packages, present the information clearly with title, destination, duration, and price.

Current Available Travel Packages from Database:
${JSON.stringify(packagesContext, null, 2)}`;

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message },
  ];

  try {
    const groq = new Groq({
      apiKey: env.GROQ_API_KEY,
      timeout: 15000,
    });

    const completion = await groq.chat.completions.create({
      model: env.GROQ_MODEL,
      messages: messagesPayload,
      temperature: 0.5,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'Thank you for contacting us. How else may I assist your travel plans?';

    res.status(200).json({
      success: true,
      message: 'Chat response generated',
      data: {
        reply,
        model: env.GROQ_MODEL,
      },
    });
  } catch (error) {
    // Map upstream errors cleanly without leaking keys or raw stack traces
    if (error.status === 401 || error.status === 403 || error.message?.includes('API key')) {
      throw new ApiError(503, 'AI service authentication failed. Please check server API key.', null, 'UPSTREAM_AUTH_ERROR');
    }
    if (error.status === 429) {
      throw new ApiError(429, 'AI assistant rate limit reached. Please try again shortly.', null, 'UPSTREAM_RATE_LIMIT');
    }
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      throw new ApiError(504, 'AI assistant request timed out. Please try again.', null, 'GATEWAY_TIMEOUT');
    }

    throw new ApiError(502, 'AI service temporary disruption. Please try again later.', null, 'UPSTREAM_ERROR');
  }
});
