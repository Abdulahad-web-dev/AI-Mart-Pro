# SRS-to-Implementation Coverage — AI Mart Pro

Based on the uploaded **AI Mart Pro SRS (60 pages)**, Chapter 3, Sections 3.6–3.12. The statuses below distinguish implemented functionality from integrations not supplied by the SRS itself.

| SRS ID | Function | This project's implementation |
|---|---|---|
| FR-1.1 | Registration | API `POST /api/auth/register`, salted bcrypt hash, customer/vendor registration |
| FR-1.2 | Authentication | Login/logout, JWT in HTTP-only cookie, session verification |
| FR-1.3 | Role authorization | Server-side guard for customer/vendor/admin/delivery, vendor ownership checks |
| FR-1.4 | Profiles | Profile edits and vendor store information |
| FR-2.1 | Product CRUD | Vendor-owned create, edit, deactivate, list |
| FR-2.2 | Product images | Up to 8 validated images per product, S3-compatible storage when configured; local disk fallback in development |
| FR-2.3 | Search/filter | Search, category/price/rating filters, price sorting and paginated results |
| FR-2.4 | Inventory | Stock tracking and guarded atomic decrement at checkout |
| FR-2.5 | Product details/compare | Product gallery/detail and client-side up-to-four-product comparison |
| FR-3.1 | Cart/wishlist | Add/update/delete cart items; save/remove wishlist products |
| FR-3.2 | Checkout | Server-side price recalculation and atomic order + stock database transaction |
| FR-3.3 | Order tracking | Customer history, vendor fulfilment transitions, order statuses |
| FR-3.4 | Delivery | Admin assignment, assigned-agent read, constrained status transitions and notes |
| FR-3.5 | Payments | COD/manual bank transfer status records; **no live payment processing** |
| FR-4.1 | Reviews | Rating and text reviews restricted to customers with non-cancelled purchase order |
| FR-4.2 | Moderation | Reporting and admin hide/remove/dismiss |
| FR-4.3 | Users/categories | Admin user role/suspension and create category (category deletion not implemented) |
| FR-4.4 | Audit logging | Product, order-related, admin and delivery important events (not every security read/login event) |
| FR-5.1 | Forecasts | Python FastAPI inference + synthetic-data trained random forest, 7–90 day estimate, version |
| FR-5.2 | Inventory guidance | Prediction, stock, lead time, fixed safety-day rule |
| FR-5.3 | Recommendations | Attribute/category/price-content similarity with catalogue cold-start fallback |
| FR-5.4 | Sentiment | English illustrative TF-IDF/logistic model, neutral/positive/negative, aggregates, limitations shown |
| FR-5.5 | External URL intelligence | Strict HTTPS allowlist + DNS public IP validation, redirect-blocked public title/meta extraction; unavailable unless configured |
| FR-5.6 | Prediction records | Forecast result, timestamp and model version recorded |
| FR-5.7 | Customer segmentation | **Optional; deferred** |
| FR-5.8 | Anomaly indicators | **Optional; deferred** |
| FR-6.1 | Vendor analytics | Recorded revenue/units, product performance and low-stock information with chart |
| FR-6.2 | Admin analytics | Marketplace metrics, revenue summaries, moderation and audit activity |

## Architecture alignment

Next.js + TypeScript frontend; Express REST backend; Prisma with PostgreSQL; separate private Python FastAPI AI inference service; Recharts analytics; optional S3-compatible image storage. React custom reusable components styled with Tailwind and CSS; **shadcn/ui is not installed**, but reusable button/form primitives are supplied.

## Important deployment & quality limitations

1. **AI model data:** Sales model is trained on synthetic data from `services/ai/train.py`. Included measured synthetic evaluation is *not proof* of accuracy on real Pakistani merchants; see `services/ai/models/sales_metrics.json`. The sentiment model uses a tiny English illustrative dataset and does **not** validate Roman Urdu.
2. **Production:** Live hosting, real merchant data, payment provider account, courier accounts, PostgreSQL backups and cloud object-storage credentials cannot be provisioned from an SRS. Those integrations remain configuration-dependent.
3. **External URL analysis:** Only administrator allowlisted HTTPS domains, no private network addresses, no redirects; returns public metadata rather than inferred actual sales.
4. **Demo product artwork:** SVG illustrations generated in `scripts/make_product_art.py`, replaceable by vendor uploads.
5. **Testing:** AI unit tests pass and syntax checks pass. Database/browser end-to-end and performance tests need a running Postgres and Node dependencies. SRS performance thresholds have **not** been benchmarked.
6. **Data:** Seeded records are demonstration data. Seeded orders are not real sales.
7. **API scope:** Admin supports category creation but not category rename/deletion; vendor image uploads and deletion have backend routes (UI supports uploads); some operational enhancements can be added as next iterations.

## Suggested evaluation talking points

Explain the four roles, layered design, authorization/ownership, transactional checkout, model versioning and what the AI can/cannot infer. Demonstrate 1 customer order → vendor fulfilment → admin assigns delivery → agent completes status updates. Demonstrate one forecast and show explicit synthetic training caveat.
