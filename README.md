# Make My Marriage

A wedding-management web application for couples and their families.

## Getting started

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set `MONGODB_URI` in `.env.local` to your local MongoDB or Atlas connection
string before using signup or login. The default in `.env.example` expects a
MongoDB server at `127.0.0.1:27017`.

Open [http://localhost:3000](http://localhost:3000). The homepage links to
signup and login. New accounts are stored in MongoDB and continue to the
initial wedding setup form before reaching the dashboard.

Copy `.env.example` to `.env.local` when beginning server-side integrations.
Never commit real credentials.

## Project decisions

- Next.js App Router with TypeScript, using the Node.js runtime for server
  modules that will use Mongoose and password hashing.
- Tailwind CSS for the initial styling approach. Shared UI primitives should
  only be introduced when product pages need them.
- Domain code belongs in `src/modules/<domain>`. Route Handlers under
  `src/app/api` should validate requests and delegate to domain services.
- MongoDB models should live with the module that owns their business rules;
  connection lifecycle belongs in `src/lib/db`.
- Vitest is included for unit tests; database integration and browser
  end-to-end tooling can be selected when those test layers are introduced.
- The current scaffold does not include external integration SDKs or feature
  modules. Add those with the relevant work.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the proposed codebase
boundaries and implementation order. The approved product, system, database,
and API documents are in `docs/`.
