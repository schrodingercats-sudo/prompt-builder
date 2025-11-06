# Project Structure & Organization

## File Organization
```
/
├── components/           # React components (one per file)
├── services/            # API services and external integrations
├── .kiro/              # Kiro configuration and steering
├── node_modules/       # Dependencies
├── App.tsx             # Main application component
├── index.tsx           # React app entry point
├── types.ts            # Shared TypeScript interfaces
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── .env.local          # Environment variables (API keys)
```

## Component Architecture

### Main App Structure
- **App.tsx**: Root component managing global state, routing, and user authentication
- **index.tsx**: React DOM mounting point

### Component Patterns
- Each component in separate file under `/components`
- Functional components with TypeScript interfaces for props
- Custom hooks pattern (useCallback, useEffect) for state management
- Props drilling for state sharing (no context providers)

### Key Components
- **LandingPage**: Unauthenticated user experience
- **Dashboard**: Main prompt optimization interface
- **Sidebar**: Navigation and user controls
- **AuthModal**: Authentication flow
- **CommunityPage**: Shared prompts browsing
- **MyPromptsPage**: User's saved prompts
- **SettingsPage**: User account management

## State Management Patterns

### Local Storage Keys
- `promptifyUsers`: User registration data
- `savedPrompts_${email}`: User-specific saved prompts
- `promptifyCredits_${email}`: User credit tracking

### State Structure
- Page-based routing via state objects
- Credit system with reset timers
- User authentication state in App component
- Component-specific state in individual components

## Naming Conventions
- **Files**: PascalCase for components (Dashboard.tsx)
- **Functions**: camelCase with descriptive prefixes (handleNavigateTo...)
- **Types**: PascalCase interfaces (OptimizedPromptResponse)
- **Constants**: UPPER_SNAKE_CASE (ADMIN_EMAIL)
- **CSS Classes**: Tailwind utility classes