'use client';

import { useStore } from './useStore';

export const useWishlist = () => {
  const { wishlist, toggleWishlist, isWishlisted } = useStore();
  return { wishlist, toggleWishlist, isWishlisted };
};
