# Architecture and data flows

```text
Browser (Next.js UI, role-based pages)
  | HTTPS + JSON /backend/* (same-origin rewrite)
  v
Node.js Express API (Zod validation + secure cookie JWT + RBAC)
  | Prisma                           | internal server-to-server HTTP + shared key
  v                                  v
PostgreSQL                       FastAPI AI service
 (users, products, carts,           (saved models: regression + sentiment;
  orders, audit, predictions)        content matching and inventory rules)

Product images: S3-compatible object storage in production; local dev fallback.
```

**Core data entities:** User, VendorProfile, Product, ProductImage, Category, CartItem, WishlistItem, Order, OrderItem, PaymentRecord, Delivery, Review, Report, PredictionRecord and AuditLog (see `apps/api/prisma/schema.prisma`).

**Transactional checkout:** Authenticated CUSTOMER sends address, phone, payment method. API ignores client price, loads current cart+product prices, applies guarded stock decrements, creates immutable order-item price/name snapshots and a payment record, clears cart — all inside one Prisma database transaction. If any item fails, all changes roll back.

**Delivery:** Admin assigns agent to order. Agent sees only assigned order address/contact and can move ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED, or mark FAILED from active stages. Delivering updates order state. Vendors separately advance their own order items in PLACED → CONFIRMED → PACKED → SHIPPED transitions.

**AI:** Express is sole public gateway. Authorised vendor requests a forecast for an owned product, Express gathers sales history and calls FastAPI with internal shared key. Forecast is versioned, saved and displayed as an estimate. Inventory guidance uses that forecast and supplier lead-time assumptions. Product recommendation handles cold start. Review text is classified only in supported English demo scope. A model's absence returns graceful feedback for forecast/sentiment; marketplace remains functional.

**Security:** Salted bcrypt hash; HTTP-only token cookies; server-side role checks; vendor ownership checks; image MIME/size validation + Sharp re-encoding; HTTPS requirement for external product metadata; allowlisted domains and public IP/DNS protections; redirect prevention; environmental secrets. Public hardening (TLS, rate limits, CSRF strategy for separate-site deployment, security monitoring) is still required before operating a production marketplace.
