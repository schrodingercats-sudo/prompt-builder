# Admin Panel Design

## Overview
The admin panel will be a separate section of the application accessible only to administrators. It will feature a sidebar navigation, dashboard overview, and dedicated pages for user management, analytics, and system monitoring.

## Architecture

### Route Structure
```
/admin
  ├── /dashboard (default)
  ├── /users
  ├── /prompts
  ├── /analytics
  ├── /subscriptions
  └── /settings
```

### Component Hierarchy
```
App.tsx
  └── AdminPanel (protected route)
      ├── AdminSidebar
      ├── AdminDashboard
      ├── AdminUsers
      ├── AdminPrompts
      ├── AdminAnalytics
      ├── AdminSubscriptions
      └── AdminSettings
```

## Components and Interfaces

### 1. AdminPanel Component
**Purpose:** Main container for admin interface with route protection

**Props:**
```typescript
interface AdminPanelProps {
  currentUser: AuthUser;
  onNavigateBack: () => void;
}
```

**Features:**
- Check if user is admin (email === 'pratham.solanki30@gmail.com')
- Render sidebar navigation
- Route to different admin pages
- Handle admin logout

### 2. AdminSidebar Component
**Purpose:** Navigation sidebar for admin sections

**Features:**
- Dashboard link with icon
- Users link with icon
- Prompts link with icon
- Analytics link with icon
- Subscriptions link with icon
- Settings link with icon
- Active state highlighting
- Collapse/expand on mobile

### 3. AdminDashboard Component
**Purpose:** Overview page with key metrics

**Metrics Cards:**
- Total Users (with growth indicator)
- Total Prompts (with today's count)
- Active Subscriptions (with revenue)
- System Status (all green/red indicators)

**Charts:**
- User Growth (line chart, last 30 days)
- Prompt Activity (bar chart, last 7 days)
- AI Model Usage (pie chart)

**Recent Activity:**
- Last 10 user signups
- Last 10 prompt optimizations
- Last 10 subscription changes

### 4. AdminUsers Component
**Purpose:** User management interface

**Features:**
- Search bar (by email)
- Filter dropdown (All, Free, Pro, Cancelled)
- User table with columns:
  - Email
  - Signup Date
  - Subscription Status
  - Credits
  - Email Verified
  - Actions (View, Reset Credits, Delete)
- Pagination (50 per page)
- User detail modal
- Confirmation dialogs for destructive actions

### 5. AdminPrompts Component
**Purpose:** Prompt logs and moderation

**Features:**
- Search bar (by user email)
- Filter by AI model
- Date range picker
- Prompt table with columns:
  - User Email
  - Model Used
  - Created Date
  - Public/Private
  - Actions (View, Delete, Toggle Visibility)
- Prompt detail modal showing full content
- Export to CSV button

### 6. AdminAnalytics Component
**Purpose:** Detailed analytics and insights

**Charts:**
- User Growth Over Time (line chart, 90 days)
- Prompt Optimization Trends (area chart, 90 days)
- AI Model Distribution (donut chart)
- Subscription Conversion Funnel
- Revenue Trends (bar chart, monthly)
- Active Users by Time of Day (heatmap)

**Metrics:**
- Total Revenue
- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Conversion Rate (Free → Pro)
- Churn Rate
- Most Active Users (top 10)

### 7. AdminSubscriptions Component
**Purpose:** Subscription and payment management

**Features:**
- Filter by status (Active, Cancelled, Expired)
- Subscription table with columns:
  - User Email
  - Plan (Monthly/Yearly)
  - Payment ID
  - Start Date
  - Expiry Date
  - Status
  - Actions (View, Cancel, Reactivate)
- Revenue summary cards
- Recent payments list
- Payment detail modal

### 8. AdminSettings Component
**Purpose:** System configuration and status

**Sections:**
- **API Status:**
  - Gemini AI (connected/disconnected)
  - Firebase Auth (connected/disconnected)
  - Supabase DB (connected/disconnected)
  - Razorpay (connected/disconnected)

- **System Info:**
  - Total Database Size
  - API Request Count (today)
  - Error Rate
  - Uptime

- **Configuration:**
  - View environment variables (masked)
  - System health check button
  - Clear cache button

## Data Models

### AdminStats Interface
```typescript
interface AdminStats {
  totalUsers: number;
  totalPrompts: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
  userGrowth: number; // percentage
  promptGrowth: number; // percentage
}
```

### UserListItem Interface
```typescript
interface UserListItem {
  id: string;
  email: string;
  displayName?: string;
  signupDate: string;
  subscriptionStatus: 'free' | 'pro' | 'cancelled';
  credits: number;
  emailVerified: boolean;
  totalPrompts: number;
}
```

### PromptLogItem Interface
```typescript
interface PromptLogItem {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  modelUsed: string;
  createdAt: string;
  isPublic: boolean;
  originalLength: number;
  optimizedLength: number;
}
```

### SubscriptionItem Interface
```typescript
interface SubscriptionItem {
  id: string;
  userId: string;
  userEmail: string;
  plan: 'pro_monthly' | 'pro_yearly';
  paymentId: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'cancelled' | 'expired';
  amount: number;
}
```

## Database Service Extensions

### New Admin Methods
```typescript
// User Management
async getAllUsers(limit: number, offset: number): Promise<UserListItem[]>
async searchUsers(query: string): Promise<UserListItem[]>
async getUserStats(userId: string): Promise<UserStats>
async resetUserCredits(userId: string): Promise<void>
async deleteUserAccount(userId: string): Promise<void>

// Prompt Logs
async getAllPrompts(limit: number, offset: number): Promise<PromptLogItem[]>
async searchPrompts(query: string): Promise<PromptLogItem[]>
async deletePrompt(promptId: string): Promise<void>
async togglePromptVisibility(promptId: string): Promise<void>

// Analytics
async getUserGrowthData(days: number): Promise<ChartData[]>
async getPromptActivityData(days: number): Promise<ChartData[]>
async getModelUsageData(): Promise<ChartData[]>
async getRevenueData(months: number): Promise<ChartData[]>

// Subscriptions
async getAllSubscriptions(): Promise<SubscriptionItem[]>
async getRevenueMetrics(): Promise<RevenueMetrics>
async cancelSubscriptionAdmin(userId: string): Promise<void>
async reactivateSubscriptionAdmin(userId: string): Promise<void>

// System
async getSystemStats(): Promise<SystemStats>
async checkAPIStatus(): Promise<APIStatus>
```

## UI/UX Design

### Color Scheme
- Primary: Gray-800 (admin theme)
- Success: Green-600
- Warning: Yellow-600
- Danger: Red-600
- Info: Blue-600

### Layout
- Sidebar: 256px width, fixed position
- Main content: Full width minus sidebar
- Header: 64px height with breadcrumbs
- Cards: White background, shadow-sm, rounded-xl

### Typography
- Headings: Font-bold, text-2xl to text-4xl
- Body: Text-base, text-gray-700
- Labels: Text-sm, font-medium, text-gray-600

### Charts
- Library: Recharts
- Colors: Purple-600, Blue-600, Green-600, Orange-600
- Responsive: Min-height 300px
- Tooltips: Enabled with custom styling

### Tables
- Library: Native HTML table with Tailwind
- Striped rows for readability
- Hover effects
- Sortable columns
- Sticky header

## Error Handling

### Loading States
- Skeleton loaders for cards
- Spinner for charts
- Table loading indicator

### Error States
- Error boundary for component crashes
- Toast notifications for API errors
- Inline error messages for forms
- Retry buttons for failed requests

### Empty States
- Friendly messages when no data
- Illustrations or icons
- Call-to-action buttons

## Security Considerations

### Route Protection
- Check admin status before rendering
- Redirect non-admins to dashboard
- Server-side validation for admin APIs

### Data Access
- Row-level security in Supabase
- Admin-only database policies
- Audit logging for sensitive actions

### API Security
- Admin endpoints require authentication
- Rate limiting on admin APIs
- Input validation and sanitization

## Performance Optimization

### Data Loading
- Pagination for large datasets
- Lazy loading for charts
- Debounced search inputs
- Cached API responses

### Rendering
- React.memo for expensive components
- Virtual scrolling for long lists
- Code splitting for admin routes
- Optimized chart rendering

## Accessibility

### Keyboard Navigation
- Tab order for all interactive elements
- Keyboard shortcuts for common actions
- Focus indicators

### Screen Readers
- ARIA labels for icons
- Semantic HTML structure
- Alt text for images

### Color Contrast
- WCAG AA compliance
- High contrast mode support
- Color-blind friendly charts

## Mobile Responsiveness

### Breakpoints
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

### Adaptations
- Collapsible sidebar on mobile
- Stacked cards on small screens
- Horizontal scroll for tables
- Touch-friendly buttons (min 44px)

## Testing Strategy

### Unit Tests
- Component rendering
- Data transformation functions
- Utility functions

### Integration Tests
- Admin authentication flow
- User management operations
- Data fetching and display

### E2E Tests
- Complete admin workflows
- Chart interactions
- Table sorting and filtering

## Future Enhancements

### Phase 2
- Multi-admin support with roles
- Email notifications from admin panel
- Bulk user operations
- Advanced filtering and search

### Phase 3
- Real-time dashboard updates
- Custom report builder
- Scheduled data exports
- Webhook management

### Phase 4
- AI-powered insights
- Anomaly detection
- Predictive analytics
- A/B testing management
