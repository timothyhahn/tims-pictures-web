# Tim's Pictures Web

Public-facing read-only photo gallery built with SvelteKit 2 and Svelte 5.

## Features

- **Home Page**: Grid of 48 most recent photos with infinite scroll (12 at a time)
- **Album Browse**: View all public albums with cover images
- **Album Detail**: Masonry layout of album photos
- **Lightbox Viewer**: Full-screen image viewer with keyboard navigation
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **State Persistence**: Scroll position and data caching when navigating between pages
- **Direct Linking**: Share links to specific photos
- **Image Optimization**: Automatic image sizing via CDN query parameters
- **Loading States**: Smooth transitions and loading indicators

## Tech Stack

- **Framework**: SvelteKit 2
- **UI Library**: Svelte 5 (with runes syntax)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **API Proxy**: SvelteKit server routes
- **State Management**: Svelte 5 runes ($state, $effect, $props)
- **Session Storage**: For scroll position restoration

## Architecture

The application follows SvelteKit App Router conventions:

- `routes/` - SvelteKit routes
  - `+page.svelte` - Home page with infinite scroll
  - `albums/` - Album listing
  - `albums/[slug]/` - Album detail with masonry layout
  - `pictures/[id]/` - Picture detail view (lightbox)
  - `api/[...path]/` - API proxy to backend
- `lib/` - Shared utilities and components
  - `api/` - API client and type definitions
  - `components/` - Reusable Svelte components
    - `Navigation.svelte` - Responsive nav with sidebar
    - `PhotoGrid.svelte` - Grid layout for photos
    - `Lightbox.svelte` - Full-screen image viewer

## Key Features

### Infinite Scroll

The home page loads 12 pictures initially and automatically loads more as you scroll, up to 48 total pictures maximum.

### State Persistence

When navigating from a gallery page to a detail view and back:

- Scroll position is restored
- Previously loaded images are cached
- No unnecessary API calls
- Data freshness check (5 minutes)

### Lightbox

Full-screen image viewer with:

- Auto-hiding controls on mouse inactivity
- Keyboard navigation (ESC, ←, →, I)
- Info panel with EXIF metadata
- Loading states with smooth transitions
- Next/Previous navigation through album

### API Proxy

All API requests go through SvelteKit's `/api/*` routes to:

- Avoid CORS issues
- Enable SSR and client-side hydration
- Keep backend API private

## Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun
- Tim's Pictures API running (see `../tims-pictures-api`)

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Internal API URL (for SSR, Docker container name)
API_URL=http://api:8080

# Public API URL (for client-side, not used with proxy)
PUBLIC_API_URL=http://localhost:8080
```

Note: With the API proxy pattern, the web app always uses `/api` for requests, and the proxy forwards to `API_URL`.

## Development

### Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Using Docker Compose (Recommended)

```bash
# From the parent directory (tims.pictures/)
cd ..
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f web

# Stop services
docker-compose down
```

The web interface will be available at [http://localhost:5173](http://localhost:5173).

## Building for Production

```bash
npm run build
npm run preview
```

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

## API Integration

The web interface uses these API endpoints via the proxy:

- `GET /api/v1/pictures/recent` - Recent pictures for home page
- `GET /api/v1/albums` - List all public albums
- `GET /api/v1/albums/slug/{slug}` - Get album by slug
- `GET /api/v1/albums/{id}/pictures` - Get pictures in album
- `GET /api/v1/pictures/{id}` - Get single picture

## Image Optimization

Images are served from Bunny CDN with query parameters:

- `?class=thumbnail` - Grid/thumbnail view (responsive sizing)
- `?class=fullscreen` - Full-screen lightbox view (high quality)

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

## Testing

Run tests:

```bash
npm run test
npm run test:ui  # Interactive UI
```

## Deployment

The web interface can be deployed to:

- Vercel (SvelteKit adapter required)
- Netlify (SvelteKit adapter required)
- Docker container (included Dockerfile.dev)
- Any Node.js hosting platform

Ensure environment variables are configured in your deployment platform.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ JavaScript features
- CSS Grid and Flexbox
- Session Storage API

## License

[License information]
