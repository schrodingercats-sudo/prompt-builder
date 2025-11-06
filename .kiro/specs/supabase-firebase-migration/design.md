# Design Document

## Overview

This design outlines the migration of Promptify from local storage to a cloud-based architecture using Firebase Authentication and Supabase for data persistence. The design maintains backward compatibility while providing a seamless transition to cloud storage with offline capabilities.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │  Firebase Auth   │    │   Supabase DB   │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Auth Layer  │◄┼────┤ │ User Session │ │    │ │   Users     │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Data Layer  │◄┼────┼─┤ User ID      │◄┼────┤ │   Prompts   │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │                  │    │ ┌─────────────┐ │
│ │ Sync Layer  │◄┼────┼──────────────────┼────┤ │   Credits   │ │
│ └─────────────┘ │    │                  │    │ └─────────────┘ │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow

1. **Authentication Flow**: Firebase handles user authentication and provides user tokens
2. **Data Access**: Supabase stores all user data with Firebase UID as the foreign key
3. **Sync Strategy**: Real-time sync with offline fallback using local caching

## Components and Interfaces

### 1. Authentication Service (`authService.ts`)

```typescript
interface AuthService {
  signUp(email: string, password: string): Promise<User>
  signIn(email: string, password: string): Promise<User>
  signInWithGoogle(): Promise<User>
  signInWithGitHub(): Promise<User>
  signOut(): Promise<void>
  getCurrentUser(): User | null
  onAuthStateChanged(callback: (user: User | null) => void): () => void
}
```

### 2. Database Service (`databaseService.ts`)

```typescript
interface DatabaseService {
  // User Management
  createUserProfile(user: User): Promise<UserProfile>
  getUserProfile(uid: string): Promise<UserProfile | null>
  
  // Prompts Management
  savePrompt(prompt: SavedPrompt): Promise<SavedPrompt>
  getUserPrompts(uid: string): Promise<SavedPrompt[]>
  deletePrompt(promptId: string): Promise<void>
  
  // Credits Management
  getUserCredits(uid: string): Promise<CreditsState>
  updateCredits(uid: string, credits: CreditsState): Promise<void>
  
  // Migration
  migrateLocalData(uid: string, localData: LocalStorageData): Promise<void>
}
```

### 3. Sync Service (`syncService.ts`)

```typescript
interface SyncService {
  initialize(uid: string): Promise<void>
  syncToCloud(data: any): Promise<void>
  syncFromCloud(): Promise<any>
  enableOfflineMode(): void
  disableOfflineMode(): void
  isOnline(): boolean
}
```

### 4. Migration Service (`migrationService.ts`)

```typescript
interface MigrationService {
  detectLocalData(): LocalStorageData | null
  migrateToCloud(uid: string, localData: LocalStorageData): Promise<void>
  clearLocalData(): void
  showMigrationPrompt(): Promise<boolean>
}
```

## Data Models

### Supabase Database Schema

```sql
-- Users table (extends Firebase user data)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompts table
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_prompt TEXT NOT NULL,
  optimized_prompt TEXT NOT NULL,
  suggestions JSONB,
  model_used TEXT NOT NULL,
  image_data TEXT,
  image_mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credits table
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 2,
  reset_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (firebase_uid = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (firebase_uid = auth.jwt() ->> 'sub');

CREATE POLICY "Users can view own prompts" ON prompts
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can manage own credits" ON credits
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'
  ));
```

### TypeScript Interfaces

```typescript
interface UserProfile {
  id: string
  firebaseUid: string
  email: string
  displayName?: string
  createdAt: string
  updatedAt: string
}

interface SavedPrompt {
  id: string
  userId: string
  title: string
  originalPrompt: string
  optimizedPrompt: string
  suggestions: string[]
  modelUsed: string
  imageData?: string
  imageMimeType?: string
  createdAt: string
  updatedAt: string
}

interface CreditsState {
  id: string
  userId: string
  count: number
  resetTime: string | null
  createdAt: string
  updatedAt: string
}
```

## Error Handling

### Authentication Errors
- **Network Errors**: Retry with exponential backoff
- **Invalid Credentials**: Display user-friendly error messages
- **Rate Limiting**: Implement request throttling

### Database Errors
- **Connection Failures**: Fall back to cached data
- **Sync Conflicts**: Server data takes precedence
- **Migration Errors**: Preserve local data and retry

### Offline Handling
- **Detection**: Monitor network connectivity
- **Caching**: Store critical data locally using IndexedDB
- **Queue**: Queue operations for when connectivity returns

## Testing Strategy

### Unit Tests
- Authentication service methods
- Database service CRUD operations
- Migration logic validation
- Sync service state management

### Integration Tests
- Firebase authentication flow
- Supabase database operations
- End-to-end migration process
- Offline/online sync scenarios

### User Acceptance Tests
- Complete user registration and login flow
- Data persistence across sessions
- Migration from local storage
- Offline functionality validation

## Security Considerations

### Authentication Security
- Firebase handles secure token management
- Implement proper session timeout
- Use HTTPS for all communications

### Database Security
- Row Level Security (RLS) policies in Supabase
- Input validation and sanitization
- Encrypted sensitive data storage

### Data Privacy
- User data isolation through RLS
- Secure data transmission
- GDPR compliance for user data deletion

## Performance Optimizations

### Caching Strategy
- Cache user profile and credits locally
- Implement smart sync to reduce API calls
- Use React Query for efficient data fetching

### Database Optimization
- Index frequently queried columns
- Implement pagination for large datasets
- Use database functions for complex operations

### Network Optimization
- Batch API requests where possible
- Implement request deduplication
- Use compression for large payloads