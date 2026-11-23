'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { AIStudio } from '@/components/ai-studio';
import { DashboardView } from '@/components/dashboard-views';
import { CompareView } from '@/components/store-views';

// Storefront & Customer Screens (A1 - A20)
import { HomeVariantA } from '@/components/screens/home-variant-a';
import { HomeVariantB } from '@/components/screens/home-variant-b';
import { BrowseProductsScreen } from '@/components/screens/browse-products';
import { ProductDetailScreen } from '@/components/screens/product-detail';
import { CartScreen } from '@/components/screens/cart-screen';
import { CheckoutScreen } from '@/components/screens/checkout-screen';
import { OrderConfirmedScreen } from '@/components/screens/order-confirmed-screen';
import { TrackOrderScreen } from '@/components/screens/track-order';
import { OrderHistoryScreen } from '@/components/screens/order-history-screen';
import { WishlistScreen } from '@/components/screens/wishlist-screen';
import { ProfileScreen } from '@/components/screens/profile-screen';
import { LoginScreen } from '@/components/screens/login-screen';
import { RegisterScreen } from '@/components/screens/register-screen';
import {
  CustomerReviewsScreen,
  VendorPublicStoreScreen,
  DealsScreen,
  ContentPageScreen,
  SystemStateScreen,
} from '@/components/screens/marketplace-extra-screens';

export default function RouterView() {
  const path = usePathname() || '/';

  let page: React.ReactNode;

  // A1. Home
  if (path === '/') {
    page = <HomeVariantA />;
  } else if (path === '/home-b') {
    page = <HomeVariantB />;
  }
  // A2. Shop & Category (/shop, /category/[slug])
  else if (path === '/shop') {
    page = <BrowseProductsScreen />;
  } else if (path.startsWith('/category/')) {
    const slug = decodeURIComponent(path.split('/')[2] || '');
    page = <BrowseProductsScreen initialCategorySlug={slug} />;
  }
  // A3. Natural-Language Search (/search)
  else if (path === '/search') {
    page = <BrowseProductsScreen isSearchPage={true} />;
  }
  // A4. Product Detail (/product/[id])
  else if (path.startsWith('/product/')) {
    const id = decodeURIComponent(path.split('/')[2] || '');
    page = <ProductDetailScreen id={id} />;
  }
  // A5. Compare (/compare)
  else if (path === '/compare') {
    page = <CompareView />;
  }
  // A6. Cart (/cart)
  else if (path === '/cart') {
    page = <CartScreen />;
  }
  // A7. Checkout (/checkout)
  else if (path === '/checkout') {
    page = <CheckoutScreen />;
  }
  // A8. Order Success (/orders/[id]/success or /order-confirmed)
  else if (
    path === '/order-confirmed' ||
    (path.startsWith('/orders/') && path.endsWith('/success'))
  ) {
    page = <OrderConfirmedScreen />;
  }
  // A9. My Orders (/account/orders or /orders)
  else if (path === '/account/orders' || path === '/orders') {
    page = <OrderHistoryScreen />;
  }
  // A10. Order Details & Tracking (/account/orders/[id] or /track-order)
  else if (path.startsWith('/account/orders/') || path === '/track-order') {
    const orderId = path.startsWith('/account/orders/')
      ? decodeURIComponent(path.split('/')[3] || '')
      : undefined;
    page = <TrackOrderScreen orderIdProp={orderId} />;
  }
  // A11. Wishlist (/account/wishlist or /wishlist)
  else if (path === '/account/wishlist' || path === '/wishlist') {
    page = <WishlistScreen />;
  }
  // A12. Profile (/account/profile or /profile)
  else if (path === '/account/profile' || path === '/profile') {
    page = <ProfileScreen />;
  }
  // A13. Customer Reviews (/account/reviews)
  else if (path === '/account/reviews') {
    page = <CustomerReviewsScreen />;
  }
  // A14. Login & Register (/login, /register)
  else if (path === '/login') {
    page = <LoginScreen />;
  } else if (path === '/register') {
    page = <RegisterScreen />;
  }
  // A15. Vendor Public Store (/store/[vendorId])
  else if (path.startsWith('/store/')) {
    const vendorId = decodeURIComponent(path.split('/')[2] || 'usr-vendor-1');
    page = <VendorPublicStoreScreen vendorId={vendorId} />;
  }
  // A16. Deals (/deals or /home-c)
  else if (path === '/deals' || path === '/home-c') {
    page = <DealsScreen />;
  }
  // A17. Content Pages (/about, /contact, /blog, /blog/[slug], /stores, /faq, /returns, /privacy, /terms)
  else if (path === '/about') {
    page = <ContentPageScreen page="about" />;
  } else if (path === '/contact') {
    page = <ContentPageScreen page="contact" />;
  } else if (path === '/stores') {
    page = <ContentPageScreen page="stores" />;
  } else if (path === '/blog') {
    page = <ContentPageScreen page="blog" />;
  } else if (path.startsWith('/blog/')) {
    const slug = decodeURIComponent(path.split('/')[2] || '');
    page = <ContentPageScreen page="blog" slug={slug} />;
  } else if (path === '/faq') {
    page = <ContentPageScreen page="faq" />;
  } else if (path === '/returns') {
    page = <ContentPageScreen page="returns" />;
  } else if (path === '/privacy') {
    page = <ContentPageScreen page="privacy" />;
  } else if (path === '/terms') {
    page = <ContentPageScreen page="terms" />;
  }
  // A18. System Pages (/403, /500, /session-expired)
  else if (path === '/403') {
    page = <SystemStateScreen code="403" />;
  } else if (path === '/500') {
    page = <SystemStateScreen code="500" />;
  } else if (path === '/session-expired') {
    page = <SystemStateScreen code="SESSION_EXPIRED" />;
  }
  // A19. AI Studio (/ai-studio)
  else if (path === '/ai-studio') {
    page = (
      <div className="py-2">
        <AIStudio />
      </div>
    );
  }
  // B1–B10 Vendor Dashboard, C1–C10 Admin Dashboard, D1–D4 Delivery Dashboard
  else if (
    path.startsWith('/vendor') ||
    path.startsWith('/admin') ||
    path.startsWith('/delivery')
  ) {
    page = <DashboardView path={path} />;
  }
  // 404 Fallback
  else {
    page = <SystemStateScreen code="404" />;
  }

  return <AppShell>{page}</AppShell>;
}
