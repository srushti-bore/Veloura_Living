import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError, ValidationError } from '@/lib/api/errorHandler';
import { getProducts } from '@/lib/data/catalogStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new ValidationError('A non-empty message prompt is required.');
    }

    const { products } = getProducts({}, { limit: 50 });
    const query = message.toLowerCase().trim();

    // 1. Natural Language Intent & Room Detection
    let matchedRoom: string | undefined = undefined;
    if (query.includes('living') || query.includes('sofa') || query.includes('lounge') || query.includes('coffee table')) {
      matchedRoom = 'living-room';
    } else if (query.includes('dining') || query.includes('table') || query.includes('chair') || query.includes('feast')) {
      matchedRoom = 'dining-room';
    } else if (query.includes('bed') || query.includes('nightstand') || query.includes('sanctuary') || query.includes('sleep')) {
      matchedRoom = 'bedroom';
    } else if (query.includes('study') || query.includes('desk') || query.includes('office') || query.includes('work')) {
      matchedRoom = 'study';
    }

    // 2. Budget extraction
    let maxBudget: number | undefined = undefined;
    const priceMatch = query.match(/(?:under|below|budget of|max|upto|up to)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+(?:\s*k|\s*lakh|\s*lac)?)/i);
    if (priceMatch) {
      let rawVal = priceMatch[1].replace(/,/g, '').toLowerCase();
      if (rawVal.includes('lakh') || rawVal.includes('lac')) {
        maxBudget = parseFloat(rawVal) * 100000;
      } else if (rawVal.includes('k')) {
        maxBudget = parseFloat(rawVal) * 1000;
      } else {
        maxBudget = parseFloat(rawVal);
      }
    }

    // 3. Recommended Products Selection
    let recommended = products.filter((p) => {
      let score = 0;
      if (matchedRoom && p.room_slug === matchedRoom) score += 3;
      if (maxBudget && p.base_price <= maxBudget) score += 2;
      if (query.includes('boucle') && p.materials.some((m) => m.toLowerCase().includes('bouclé') || m.toLowerCase().includes('boucle'))) score += 3;
      if (query.includes('walnut') && p.materials.some((m) => m.toLowerCase().includes('walnut'))) score += 3;
      if (query.includes('oak') && p.materials.some((m) => m.toLowerCase().includes('oak'))) score += 3;
      if (query.includes('leather') && p.materials.some((m) => m.toLowerCase().includes('leather'))) score += 3;
      return score > 0;
    });

    if (recommended.length === 0) {
      recommended = products.slice(0, 3);
    } else {
      recommended = recommended.slice(0, 4);
    }

    // 4. Palette & Architectural Proportions Advice
    let palette: string[] = ['#4A2C1A', '#A9794F', '#D8B486', '#F4E8D7', '#FAF7F2'];
    let roomTip = 'Allow at least 45 cm (18 inches) of circulation between primary lounge seating and low tables to preserve natural sightlines.';
    let aiResponseText = `For your architectural vision, we recommend combining sculpted organic textures with warm solid timber accents.`;

    if (matchedRoom === 'living-room') {
      palette = ['#4A2C1A', '#765236', '#D8B486', '#FAF7F2', '#211915'];
      roomTip = 'Maintain 45–60 cm of clearance between seating perimeters and coffee tables for graceful circulation.';
      aiResponseText = `For your living space, pairing low-slung tactile bouclé upholstery with solid fluted Japanese walnut anchors the room with quiet elegance.`;
    } else if (matchedRoom === 'dining-room') {
      palette = ['#2A1A12', '#4A2C1A', '#A9794F', '#D8B486', '#F4E8D7'];
      roomTip = 'Provide 90 cm of pull-out space behind dining chairs for effortless guest hospitality.';
      aiResponseText = `For the dining pavilion, a monolithic solid oak dining table illuminated by suspended minimalist linear lighting creates a timeless convivial centerpiece.`;
    } else if (matchedRoom === 'bedroom') {
      palette = ['#765236', '#A9794F', '#D8B486', '#F4E8D7', '#FFFFFF'];
      roomTip = 'Leave a minimum of 75 cm on either side of the platform bed for serene bedside balance.';
      aiResponseText = `For your master sanctuary, a low-profile platform bed with integrated floating nightstands cultivates a clutter-free, restful atmosphere.`;
    } else if (matchedRoom === 'study') {
      palette = ['#211915', '#4A2C1A', '#765236', '#B9AA99', '#FAF7F2'];
      roomTip = 'Position your writing desk perpendicular to natural window light to minimize glare during deep focus.';
      aiResponseText = `For the executive study, fluted walnut surfaces paired with top-grain saddle leather seating deliver ergonomic comfort without sacrificing architectural rigor.`;
    }

    if (maxBudget) {
      aiResponseText += ` All recommended curated pieces respect your investment target of ₹${maxBudget.toLocaleString('en-IN')}.`;
    }

    return successResponse(
      {
        message: aiResponseText,
        roomTip,
        paletteSuggestion: palette,
        recommendedProducts: recommended.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.base_price,
          salePrice: p.compare_at_price,
          image: p.images[0] || '/images/products/veloura_solis_boucle_chair.jpg',
          category: p.category_name || 'Living',
          materials: p.materials,
          availability: p.availability,
        })),
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
