# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native + Expo mobile application for managing radio program listening tasks using radiko's time-free feature. The app helps users track radio programs they want to listen to within the 7-day playback window.

**Tech Stack:**

- React Native (v0.81.5)
- Expo SDK (~54.0.25)
- TypeScript (~5.9.2)
- expo-sqlite (planned for local database)

**Target Platforms:** iOS and Android

## Development Commands

### Running the Application

```bash
npm start           # Start Expo development server
npm run android     # Run on Android emulator/device
npm run ios         # Run on iOS simulator/device
npm run web         # Run in web browser
```

### Project Structure Commands

The app is currently in initial setup phase. No build, test, or lint commands are configured yet.

## Architecture Overview

### Application Pattern

The app follows a **Component-Based Architecture** with clear separation of concerns:

- **Presentation/Container Pattern**: Separates UI from business logic
- **Custom Hooks**: Encapsulates reusable state management and business logic
- **Context API**: Manages global state (database connections)

### Directory Structure

```
src/
├── components/       # Reusable UI components (Atomic Design)
│   ├── atoms/       # Basic building blocks (Button, Text, Badge, Input, Icon)
│   ├── molecules/   # Combinations of atoms (StatusIndicator, DeadlineInfo, TimePickerField)
│   └── organisms/   # Complex components (TaskCard, ProgramForm, DeleteConfirmDialog)
├── screens/         # Screen components (TaskListScreen, ProgramFormScreen, TaskDetailScreen, HistoryScreen)
├── hooks/           # Custom hooks (useTasks, useProgram)
├── contexts/        # Context API providers (DatabaseContext)
├── services/        # Database operations (TaskService, ProgramService, database initialization)
├── utils/           # Utility functions (dateUtils, errorHandler)
├── types/           # TypeScript type definitions
├── constants/       # Constants (status config, time options, day of week options)
├── theme/           # Theme and styling configuration
└── navigation/      # Navigation setup
```

### Key Design Patterns

#### Atomic Design for Components

Components are organized in three levels:

- **Atoms**: Smallest UI units (buttons, inputs, badges)
- **Molecules**: Simple combinations (status indicators, form fields)
- **Organisms**: Complex components with business logic (cards, forms, dialogs)

#### Database Architecture

Uses **expo-sqlite** with two main tables:

- `programs`: Master data for radio programs (station, name, schedule, repeat settings)
- `tasks`: Individual listening tasks generated from programs

**Key Relationships:**

- 1:N relationship (programs → tasks) with CASCADE delete
- Tasks are automatically generated based on program repeat settings
- Expired tasks trigger automatic cleanup and next task generation

#### State Management Strategy

- **Local state**: Component-level with useState
- **Shared state**: Custom hooks (useTasks, useProgram) for data operations
- **Global state**: DatabaseContext for database connection
- **No external state management library** (Redux/MobX not needed for this scope)

## Important Business Logic

### Task Lifecycle

1. **Creation**: Tasks are auto-generated from program master data
2. **Status Progression**: unlistened → listening → completed
3. **Expiration**: Tasks expire 7 days + 29 hours (8 days, 5:00 AM) after broadcast
4. **Cleanup**: Expired tasks are deleted on app launch, triggering next task generation for weekly programs

### Time Handling

- **Broadcast Time Range**: 5:00 - 29:00 (29:00 = next day 5:00 AM)
- **Time Format**: ISO8601 strings in local timezone
- **Deadline Calculation**: Broadcast datetime + 8 days, normalized to 5:00 AM
- **SQLite Functions**: Use `datetime('now', 'localtime')` for consistency

### Repeat Settings

- **none**: One-time programs (no auto-generation after completion)
- **weekly**: Recurring programs (auto-generate next task on completion or expiration)

### Deletion Behavior

- **Single tasks (repeat_type='none')**: Simple delete
- **Recurring tasks (repeat_type='weekly')**: Two options:
  - Delete this instance only (task record)
  - Delete entire series (program + all tasks via CASCADE)

## Critical Implementation Notes

### Database Operations

- **Always use parameterized queries** to prevent SQL injection
- **Wrap multi-step operations in transactions** (`db.withTransactionAsync`)
- **Implement proper error handling** for constraint violations (FOREIGN KEY, CHECK)
- **Index usage**: Critical indexes exist on deadline_datetime, status, and program_id

### Date/Time Best Practices

```typescript
// Always use dayjs with timezone plugin
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

// Handle 29-hour format (overnight broadcasts)
const hour = 25; // 1:00 AM next day
const actualHour = hour >= 24 ? hour - 24 : hour;
const date = dayjs().hour(actualHour);
if (hour >= 24) date.add(1, 'day');
```

### Performance Optimization

- **Memoization**: Use `useMemo` for sorted/filtered lists, `useCallback` for event handlers
- **FlatList optimization**: Enable `removeClippedSubviews`, set appropriate `windowSize`
- **Component memoization**: Use `React.memo` with custom comparison functions for task cards

### Error Handling Pattern

```typescript
// Use custom AppError class
import { AppError, handleError } from '@/utils/errorHandler';

try {
  // database operation
} catch (error) {
  handleError(error); // Shows user-friendly alert and logs error
}
```

### Notification Requirements

- Reminder notification sent at 18:00, one day before deadline
- Notification content includes program name, station, and remaining time
- Notification settings are ON by default (no OFF toggle in Phase 1)

## Important Constraints

### Data Validation

- **Programs**: day_of_week (0-6), hour (5-29), minute (0,15,30,45)
- **Tasks**: status must be 'unlistened'|'listening'|'completed'
- **Referential Integrity**: All tasks must reference valid program_id

### UI/UX Requirements

- Operations must feel instantaneous (< 500ms response time)
- Minimal tap count for common operations
- Status changes are immediate with auto-save
- Deadline urgency indicated by color: red (≤1 day), yellow (2-3 days), gray (4+ days)

### Data Retention

- **Active tasks**: Until completed or expired
- **History**: Completed tasks retained for 1 month
- **Cleanup timing**: App launch only (no background processing)

## Common Pitfalls to Avoid

1. **Do not batch status updates**: Mark tasks as completed immediately, not after multiple completions
2. **Do not skip transaction wrapping**: Program creation + task generation must be atomic
3. **Do not modify existing tasks when editing programs**: Only affects future task generation
4. **Do not use string concatenation for SQL**: Always use parameterized queries
5. **Do not forget CASCADE behavior**: Deleting a program removes all its tasks

## Phase 1 Scope (MVP)

This is the initial implementation phase. The following features are intentionally excluded:

- radiko API integration (manual input only)
- Search and filter functionality
- Statistics and visualization
- Notification customization (time/on-off settings)
- Backup and sync features
- Dark mode

Focus on core task management, automatic task generation, and basic notifications.

## Component Development Guidelines

### When creating new components:

1. Place in appropriate atomic level (atom/molecule/organism)
2. Use theme values from `@/theme` for styling
3. Apply proper TypeScript interfaces for props
4. Use `memo` for components in lists
5. Reference constants from `@/constants` not hardcoded values

### When implementing screens:

1. Use custom hooks (useTasks, useProgram) for data operations
2. Implement proper loading and error states
3. Use `useCallback` for event handlers to prevent re-renders
4. Implement proper cleanup in `useEffect` return functions

### When writing database services:

1. All methods should be static class methods
2. Return TypeScript-typed results (not `any`)
3. Handle errors explicitly with try-catch
4. Use transactions for multi-step operations
5. Log operations for debugging

## Japanese Language Context

This application is designed for Japanese users listening to Japanese radio programs:

- UI text should be in Japanese
- Date formats use Japanese conventions (YYYY/MM/DD(ddd))
- Time uses 24+ hour format to handle overnight broadcasts
- Timezone is always Asia/Tokyo

## Testing Strategy

When tests are implemented:

- **Unit tests**: Utils (dateUtils) and Services (TaskService, ProgramService)
- **Component tests**: Atoms and Molecules
- **Integration tests**: Full user flows (create program → complete task → verify next generation)
- Use Jest + React Native Testing Library
- 日本語で回答すること。
- Claude Code 起動時には、 @docs 内のドキュメントを読んで要件、設計、現状を把握すること。
- プログラム実装時には、 @docs\react-native-best-practices-2025.md に準拠すること。例外にはコメントで理由を記載すること。
