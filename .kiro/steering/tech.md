# Technology Stack

## Frontend Framework
- **React 19.2.0** with TypeScript
- **Vite** as build tool and dev server
- **JSX Transform**: Uses automatic JSX runtime (react-jsx)

## Styling & UI
- **Tailwind CSS** for styling (utility-first approach)
- Custom SVG icons in dedicated Icons component
- Responsive design with mobile-first approach

## State Management
- React hooks (useState, useCallback, useEffect)
- Local storage for persistence (user data, prompts, credits)
- No external state management library

## API Integration
- **Google Gemini AI** (@google/genai) for prompt optimization
- Environment variables for API keys (GEMINI_API_KEY)
- Mock responses for development without API key

## Build System & Development

### Common Commands
```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Configuration
- **TypeScript**: ES2022 target, bundler module resolution
- **Path aliases**: `@/*` maps to project root
- **Vite config**: Custom port (3000), environment variable injection
- **Environment**: Uses `.env.local` for API keys

## Project Structure Patterns
- Components in `/components` directory
- Services in `/services` directory  
- Shared types in root `types.ts`
- No external routing library (custom page state management)