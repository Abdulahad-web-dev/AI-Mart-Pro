# AI Mart Pro ko Windows laptop par chalane ka tareeqa

**Yeh ZIP coding/project files hai, seedha double-click se website start nahi hogi.** Node.js, Python aur PostgreSQL/Docker installed hone chahiye. Internet se dependencies download hongi.

1. ZIP extract karo. VS Code mein `ai-mart-pro` folder kholo.
2. Docker Desktop install/start karke terminal mein `docker compose up -d postgres` chalao. Agar apne PostgreSQL hai to `.env` mein database URL set karo.
3. `apps/api/.env.example` ki copy `apps/api/.env` banao. `apps/web/.env.example` ko `apps/web/.env.local` aur `services/ai/.env.example` ko `services/ai/.env` mein copy karo. API ka `JWT_SECRET` strong rakho.
4. Project root terminal mein:
   ```
   npm install
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```
5. Alag terminal mein `cd services/ai` aur `python -m pip install -r requirements.txt`, phir `python -m uvicorn main:app --port 8000 --reload`.
6. Do aur terminals mein, project root se: `npm run dev:api` aur `npm run dev:web`.
7. Browser mein **http://localhost:3000** kholo.

Demo logins (password sab ka `Demo12345!`):

- Buyer: `customer@aimart.test`
- Seller: `vendor@aimart.test`
- Admin: `admin@aimart.test`
- Delivery: `delivery@aimart.test`

**AI caution:** Sales prediction synthetic training data pe based hai, real customer sales ke liye accuracy claim mat karna. Payment processing real bank se connected nahi hai; COD/manual payment records available hain. README mein detailed instructions hain.
