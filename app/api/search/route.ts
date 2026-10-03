import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/errorHandler';
import { getProducts, getCategories } from '@/lib/data/catalogStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('search') || '';

    if (!query.trim()) {
      const popularSearches = [
        'Solis Bouclé Occasional Chair',
        'Kyoto Sculptural Walnut Table',
        'Elysian Platform Bed',
        'Living Room Minimalist',
        'Solid Walnut Dining',
        'Brass Floor Lamp',
      ];
      const categories = getCategories().slice(0, 5);
      return successResponse({ suggestions: popularSearches, categories, products: [] }, 200);
    }

    const cleanQuery = query.toLowerCase().trim();

    // 1. Natural Language Price Constraint Extraction (e.g. "under 80000" or "below 50000")
    let maxPrice: number | undefined;
    const priceMatch = cleanQuery.match(/(?:under|below|less than|within)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
    if (priceMatch && priceMatch[1]) {
      maxPrice = Number(priceMatch[1].replace(/,/g, ''));
    }

    // 2. Perform faceted search
    const { products, total } = getProducts(
      {
        search: cleanQuery.replace(/(?:under|below|less than|within)\s*(?:₹|rs\.?|inr)?\s*[0-9,]+/i, '').trim(),
        maxPrice,
      },
      { limit: 12 }
    );

    // 3. Matched Categories
    const allCategories = getCategories();
    const matchedCategories = allCategories.filter((c) =>
      c.name.toLowerCase().includes(cleanQuery) || c.slug.toLowerCase().includes(cleanQuery)
    );

    // 4. Generate dynamic suggestions
    const suggestions: string[] = [];
    products.slice(0, 5).forEach((p) => {
      suggestions.push(p.name);
    });
    matchedCategories.forEach((c) => {
      suggestions.push(c.name);
    });

    return successResponse(
      {
        query,
        detectedConstraints: {
          maxPrice,
        },
        suggestions: Array.from(new Set(suggestions)),
        categories: matchedCategories,
        products,
        total,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
