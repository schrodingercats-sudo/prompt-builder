# Loading and Error States Documentation

This document describes the loading and error state components implemented for the admin panel.

## Components

### 1. ErrorBoundary
A React error boundary component that catches JavaScript errors anywhere in the child component tree.

**Usage:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Props:**
- `children`: ReactNode - Components to wrap
- `fallback?`: ReactNode - Custom fallback UI
- `onError?`: (error, errorInfo) => void - Error callback

**Features:**
- Catches rendering errors
- Displays ErrorFallback by default
- Provides reset functionality
- Logs errors to console

### 2. ErrorFallback
A user-friendly error display component with retry functionality.

**Usage:**
```tsx
<ErrorFallback
  error={error}
  onReset={handleRetry}
  title="Custom Error Title"
  message="Custom error message"
  showDetails={true}
/>
```

**Props:**
- `error`: Error | null - The error object
- `onReset?`: () => void - Retry callback
- `title?`: string - Error title (default: "Something went wrong")
- `message?`: string - Error message
- `showDetails?`: boolean - Show error details (default: true)

**Features:**
- Displays error icon
- Shows error message and details
- Provides "Try Again" button
- Includes "Reload Page" fallback

### 3. EmptyState
A component for displaying empty states with optional actions.

**Usage:**
```tsx
<EmptyState
  title="No Data Found"
  message="There are no items to display."
  action={{
    label: "Create New",
    onClick: handleCreate
  }}
/>
```

**Props:**
- `icon?`: ReactNode - Custom icon
- `title`: string - Empty state title
- `message`: string - Empty state message
- `action?`: { label: string, onClick: () => void } - Optional action button

**Features:**
- Centered layout
- Custom or default icon
- Optional call-to-action button
- Responsive design

### 4. LoadingSpinner
A customizable loading spinner component.

**Usage:**
```tsx
<LoadingSpinner
  size="lg"
  color="purple"
  text="Loading data..."
  fullScreen={false}
/>
```

**Props:**
- `size?`: 'sm' | 'md' | 'lg' | 'xl' - Spinner size (default: 'md')
- `color?`: 'purple' | 'blue' | 'gray' - Spinner color (default: 'purple')
- `text?`: string - Loading text
- `fullScreen?`: boolean - Full screen overlay (default: false)

**Features:**
- Multiple sizes
- Color variants
- Optional loading text
- Full screen mode

### 5. SkeletonLoader
A skeleton loader component for different content types.

**Usage:**
```tsx
<SkeletonLoader variant="table" count={5} />
```

**Props:**
- `variant?`: 'card' | 'table' | 'chart' | 'list' | 'text' - Loader type (default: 'text')
- `count?`: number - Number of skeleton items (default: 1)
- `className?`: string - Additional CSS classes

**Variants:**
- **card**: Stats card skeleton
- **table**: Table rows skeleton
- **chart**: Chart container skeleton
- **list**: List items skeleton
- **text**: Text lines skeleton

**Features:**
- Multiple variants for different content
- Animated pulse effect
- Customizable count
- Responsive design

### 6. RetryButton
A button component with built-in retry logic and loading state.

**Usage:**
```tsx
<RetryButton
  onRetry={loadData}
  text="Retry"
  loadingText="Retrying..."
  variant="primary"
/>
```

**Props:**
- `onRetry`: () => Promise<void> | void - Retry function
- `text?`: string - Button text (default: "Retry")
- `loadingText?`: string - Loading text (default: "Retrying...")
- `className?`: string - Additional CSS classes
- `variant?`: 'primary' | 'secondary' - Button style (default: 'primary')

**Features:**
- Automatic loading state
- Async support
- Error handling
- Disabled during retry
- Icon with animation

## Implementation Examples

### Admin Dashboard
```tsx
// Loading state for metrics cards
{loading ? (
  <SkeletonLoader variant="card" count={4} />
) : (
  <StatsCard {...props} />
)}

// Error state with retry
{error && (
  <ErrorFallback
    error={new Error(error)}
    onReset={loadStats}
    title="Failed to Load Dashboard"
    message="We couldn't load the dashboard data. Please try again."
  />
)}

// Loading state for charts
{chartsLoading ? (
  <SkeletonLoader variant="chart" />
) : (
  <UserGrowthChart data={data} />
)}
```

### Admin Users
```tsx
// Table loading state
{loading ? (
  <SkeletonLoader variant="table" count={10} />
) : filteredUsers.length === 0 ? (
  <EmptyState
    title="No Users Found"
    message="No users match your search criteria."
    action={{
      label: "Clear Search",
      onClick: () => setSearchQuery('')
    }}
  />
) : (
  <UsersTable data={filteredUsers} />
)}
```

### Admin Panel (Error Boundary)
```tsx
<ErrorBoundary>
  {renderPage()}
</ErrorBoundary>
```

## Best Practices

### 1. Loading States
- Use skeleton loaders for content that will appear
- Match skeleton structure to actual content
- Show loading spinners for actions/operations
- Provide loading text for clarity

### 2. Error States
- Always provide a retry mechanism
- Show user-friendly error messages
- Include error details in development
- Log errors for debugging

### 3. Empty States
- Explain why content is empty
- Provide actionable next steps
- Use appropriate icons
- Keep messages concise

### 4. Error Boundaries
- Wrap major sections/pages
- Provide fallback UI
- Log errors for monitoring
- Allow recovery without full reload

## Accessibility

All components follow accessibility best practices:
- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance

## Performance

Loading and error components are optimized for performance:
- Minimal re-renders
- Lightweight animations
- No external dependencies
- CSS-based animations
- Lazy loading support

## Testing

Components can be tested by:
1. Simulating loading states
2. Triggering errors
3. Testing retry mechanisms
4. Verifying empty states
5. Checking error boundaries

## Future Enhancements

Potential improvements:
- Progress indicators for long operations
- Animated transitions
- Custom skeleton shapes
- Error reporting integration
- Analytics tracking
- Internationalization support
