JABARI PUBLIC SITE — COMPLETE CMS + LIVE PAGE PACKAGE

This package includes the CMS editor, all 3 API route files, the database migration, and the public Home/Services/Projects/About pages connected to saved content.

IMPORTANT: ZIP filenames are deliberately descriptive. Rename files to the exact Next.js names and place them at the destinations below. Do not upload the descriptive ZIP filenames as route/page filenames.

ZIP FILE                         FINAL GITHUB DESTINATION
command-public-site-page.tsx      app/command/public-site/page.tsx (replace)
command-center.css                app/command-center.css (replace)
public-site-route.ts              app/api/public-site/route.ts (add/replace)
media-route.ts                    app/api/media/route.ts (add/replace)
media-id-route.ts                 app/api/media/[id]/route.ts (add/replace)
public-site-cms-migration.sql     db/migrations/004_public_site_cms.sql (add)
public-site-types.ts              lib/public-site/types.ts (add/replace)
public-site-data.ts               lib/public-site/data.ts (replace with this version)
home-page.tsx                     app/page.tsx (replace)
services-page.tsx                 app/services/page.tsx (add/replace)
projects-page.tsx                 app/projects/page.tsx (add/replace)
about-page.tsx                    app/about/page.tsx (add/replace)
public-site-render.tsx             lib/public-site/public-site-render.tsx (add)
public-site-content.css            app/public-site-content.css (add)

ROOT LAYOUT
Do NOT replace app/layout.tsx. Preserve your current metadata, fonts, and providers. Ensure these two imports are present in your existing app/layout.tsx:
  import "./command-center.css";
  import "./public-site-content.css";

DEPENDENCIES / DATABASE
1. In your project terminal run:
   npm install sanitize-html
   npm install -D @types/sanitize-html
2. Ensure @neondatabase/serverless is installed (the existing project already uses it).
3. Set DATABASE_URL in your deployment environment.
4. Apply db/migrations/004_public_site_cms.sql to the Neon production database before testing. It creates two tables and does not drop existing tables.

WHAT THIS PACKAGE CONNECTS
- The Command Center editor saves content through /api/public-site.
- Media uploads use /api/media and are served from /api/media/[id].
- Public Home, Services, Projects and About pages read saved content from Neon.
- Rich HTML is sanitized before public rendering.
- Services and Projects have separate link text and destination URL fields.

SECURITY — REQUIRED BEFORE PUBLIC DEPLOYMENT
The API routes in this package do not add authentication. Protect /command and the write/upload APIs (/api/public-site PUT and /api/media POST) with your existing operator authentication before exposing the site publicly. The public GET endpoint should only expose content intended to be public. Do not assume a hidden URL is security.

UPLOAD CHECKLIST
- Rename each file exactly as shown in the destination table.
- Confirm app/services/page.tsx is used (not app/work/page.tsx).
- Confirm the existing app/layout.tsx contains both CSS imports above.
- Apply the migration and confirm DATABASE_URL is set.
- Install the sanitizer dependency.
- Build/deploy and test /command/public-site; save a harmless test edit and verify the public page updates.

This archive packages the files; it does not apply the migration, upload to GitHub, configure environment variables, or verify your live deployment automatically.
