/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/wishlistApi';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist();
      const packages = res.data?.wishlist || res.data?.packages || [];
      setWishlistItems(packages);
      setWishlistIds(new Set(packages.map((pkg) => pkg._id || pkg.id || pkg)));
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (pkg) => {
    if (!isAuthenticated) {
      return { requireAuth: true };
    }
    const pkgId = pkg._id || pkg.id;
    const isSaved = wishlistIds.has(pkgId);

    try {
      if (isSaved) {
        await wishlistApi.remove(pkgId);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(pkgId);
          return next;
        });
        setWishlistItems((prev) => prev.filter((p) => (p._id || p.id) !== pkgId));
      } else {
        await wishlistApi.add(pkgId);
        setWishlistIds((prev) => new Set([...prev, pkgId]));
        setWishlistItems((prev) => [...prev, pkg]);
      }
      return { success: true, saved: !isSaved };
    } catch (err) {
      console.error('Failed to toggle wishlist', err);
      return { success: false, error: err.response?.data?.message || 'Error updating wishlist' };
    }
  };

  const isInWishlist = (pkgId) => wishlistIds.has(pkgId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistIds.size,
        isInWishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
