# Tim's Pictures Web

Public-facing read-only photo gallery built with SvelteKit 2 and Svelte 5.

## Tech Stack

- **Framework**: SvelteKit 2
- **Styling**: Tailwind CSS 4.0

## Architecture

- `routes/` - SvelteKit routes
  - `+page.svelte` - Home page with infinite scroll
  - `albums/` - Album listing
  - `albums/[slug]/` - Album detail with masonry layout
  - `pictures/[id]/` - Picture detail
  - `api/[...path]/` - API proxy to backend
  - `health/` - Health check endpoint
- `lib/` - Shared utilities and components
  - `api/` - API client functions
  - `components/` - Organized by feature
    - `album-card/` - Album card components
    - `lightbox/` - Lightbox viewer components
    - `masonry-photo-grid/` - Masonry layout components
    - `shared/` - Shared UI components
  - `composables/` - Reusable composition functions (usePaginatedPictures, useInfiniteScroll)
  - `utils/` - Utility functions (analytics, scroll, metadata, etc.)

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Internal API URL (for SSR, Docker container name)
API_URL=http://api:8080
```

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

## User Experience

### Navigation

- **Desktop**: Sidebar navigation on left with Home and Albums
- **Mobile**: Hamburger menu with responsive design
- **Link**: External link to allie.today

### Home Page

- Grid layout showing 12 most recent photos
- Automatically loads more as you scroll (up to 48 total)
- Max 3 columns on large screens
- Click any photo to open in lightbox

### Album Pages

- All albums shown with cover images
- Masonry layout for album photos
- Preserves natural aspect ratios

### Lightbox

- Full-screen image viewing
- Click outside image to close
- Arrow buttons for next/previous
- Press ESC to close
- Press ← → to navigate
- Press I to toggle info panel
- Auto-hiding controls after 2 seconds of inactivity

### Performance

- Lazy loading images with `loading="lazy"`
- CDN optimization with `?class=thumbnail` and `?class=fullscreen`
- Session storage caching for fast back navigation
- Smooth loading transitions

## Code Style

The project uses:

- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode
- Svelte 5 runes syntax

Run checks:

```bash
npm run lint
npm run check
```

## Deployment

Deployed using `fly deploy`.
