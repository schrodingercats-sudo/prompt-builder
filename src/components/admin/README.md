# Admin Panel Reusable Components

This directory contains reusable components for the admin panel.

## Components

### StatsCard
Display key metrics with optional growth indicators.

```tsx
import { StatsCard } from './admin';

<StatsCard
  title="Total Users"
  value={1234}
  growth={12.5}
  icon={<UserIcon />}
  loading={false}
/>
```

### DataTable
Generic table component with sorting and custom rendering.

```tsx
import { DataTable, Column } from './admin';

const columns: Column<User>[] = [
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', render: (val) => <Badge>{val}</Badge> },
];

<DataTable
  columns={columns}
  data={users}
  keyExtractor={(row) => row.id}
  onRowClick={(row) => console.log(row)}
/>
```

### SearchBar
Debounced search input.

```tsx
import { SearchBar } from './admin';

<SearchBar
  placeholder="Search users..."
  onSearch={(query) => setSearchQuery(query)}
  debounceMs={300}
/>
```

### FilterDropdown
Dropdown filter with options.

```tsx
import { FilterDropdown, FilterOption } from './admin';

const options: FilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
];

<FilterDropdown
  label="Status"
  options={options}
  value={filter}
  onChange={setFilter}
/>
```

### ConfirmDialog
Confirmation modal for destructive actions.

```tsx
import { ConfirmDialog } from './admin';

<ConfirmDialog
  isOpen={showDialog}
  title="Delete User"
  message="Are you sure you want to delete this user?"
  variant="danger"
  onConfirm={handleDelete}
  onCancel={() => setShowDialog(false)}
/>
```

### Toast Notifications
Global toast notification system.

```tsx
import { ToastContainer, showToast } from './admin';

// Add ToastContainer to your app root
<ToastContainer position="top-right" />

// Show toasts from anywhere
showToast('success', 'User deleted successfully');
showToast('error', 'Failed to delete user', 'Please try again');
```

### Chart Components

```tsx
import { ChartContainer, ChartTooltip, ChartLegend } from './admin';

<ChartContainer
  title="User Growth"
  subtitle="Last 30 days"
  loading={loading}
  error={error}
>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      {/* Chart content */}
    </LineChart>
  </ResponsiveContainer>
</ChartContainer>
```

## Utility Functions

```tsx
import { formatCurrency, formatDate, formatNumber, exportToCSV, debounce } from './admin';

// Format currency
formatCurrency(1234.56); // "$1,234.56"

// Format dates
formatDate(new Date()); // "Nov 9, 2025"
formatDate(new Date(), true); // "Nov 9, 2025, 02:30 PM"

// Format numbers
formatNumber(1234567); // "1,234,567"
formatNumber(3.14159, 2); // "3.14"

// Export to CSV
exportToCSV(data, 'users-export');

// Debounce function
const debouncedSearch = debounce((query) => {
  // Search logic
}, 300);
```
