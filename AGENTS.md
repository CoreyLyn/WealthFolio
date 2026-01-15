# AGENTS.md - WealthFolio Coding Guidelines

> Guidelines for AI coding agents working in this repository.

## Project Overview

**WealthFolio** is a family wealth management application built with:
- **Frontend**: React 19 + TypeScript 5.9 + Vite 7
- **Styling**: TailwindCSS 3.4 + shadcn/ui components
- **Backend**: Supabase (Auth + PostgreSQL)
- **Charts**: Chart.js + react-chartjs-2

## Commands

```bash
# Development
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run preview      # Preview production build

# Code Quality
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript type check

# No test framework configured yet
# When adding tests, use: npm test -- path/to/file.test.ts
```

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # shadcn/ui primitives (Button, Input, Dialog, etc.)
│   └── *.tsx        # Feature components
├── contexts/        # React Context providers (AuthContext)
├── hooks/           # Custom hooks (useAppState)
├── lib/             # Utilities (supabase client, cn() helper)
├── types/           # TypeScript type definitions
└── App.tsx          # Root component
```

## Code Style

### Imports
```typescript
// 1. React/external libraries first
import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'

// 2. Internal absolute imports (@/ alias)
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

// 3. Relative imports for siblings
import type { AssetAccount, LiabilityAccount } from '../types'

// IMPORTANT: Use `import type` for type-only imports
```

### TypeScript
```typescript
// Use interfaces for object shapes
interface AccountFormProps {
  type: 'asset' | 'liability'
  onClose: () => void
}

// Use type for unions/primitives
type ModalType = 'asset' | 'liability' | null

// Avoid `any` - use `unknown` if type is truly unknown
// Never use @ts-ignore or @ts-expect-error
```

### Components
```typescript
// Arrow function components with explicit return types
export function AccountForm({ type, onClose }: AccountFormProps) {
  // Hooks at top
  const [loading, setLoading] = useState(false)
  
  // Handlers
  const handleSubmit = useCallback(async () => {
    // ...
  }, [dependencies])

  // Render
  return (...)
}
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `AccountForm`, `AuthProvider` |
| Hooks | camelCase with `use` prefix | `useAppState`, `useAuth` |
| Variables/Functions | camelCase | `totalAssets`, `handleSubmit` |
| Constants | SCREAMING_SNAKE_CASE | `ASSET_CATEGORIES` |
| Types/Interfaces | PascalCase | `AssetAccount`, `AppState` |
| Files (components) | PascalCase.tsx | `AccountForm.tsx` |
| Files (utilities) | camelCase.ts | `useAppState.ts` |

### Styling
```typescript
// Use cn() helper for conditional Tailwind classes
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  condition && "conditional-classes"
)} />

// Prefer Tailwind utilities over custom CSS
// Use CSS variables for theming (dark mode support)
```

### Supabase Patterns
```typescript
// Database columns: snake_case
// TypeScript properties: camelCase
// Map between them when fetching/inserting

const assets = (data ?? []).map(a => ({
  id: a.id,
  userId: a.user_id,        // DB -> TS mapping
  createdAt: a.created_at,
}))

// Always check for user before DB operations
if (!user) return

// Use RLS - never trust client-side filtering alone
```

### Error Handling
```typescript
// Destructure error from Supabase responses
const { data, error } = await supabase.from('assets').select('*')

if (error) {
  console.error('Failed to fetch assets:', error.message)
  return
}

// For user-facing errors, display meaningful messages
```

### Comments
```typescript
// NO comments unless absolutely necessary:
// - Complex algorithms
// - Non-obvious business logic
// - Security considerations

// Bad: // Get the user
// Good: (no comment needed - code is self-explanatory)
```

## UI Components (shadcn/ui)

Available components in `@/components/ui/`:
- `Button`, `Input`, `Label`, `Textarea`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`

```typescript
// Import pattern
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
```

## Environment Variables

```bash
# .env (gitignored)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Access via `import.meta.env.VITE_*`

## Domain Context

- **资产 (Assets)**: Bank deposits, stocks, funds, real estate, vehicles
- **负债 (Liabilities)**: Mortgages, credit cards, loans
- **快照 (Snapshots)**: Point-in-time wealth records
- Currency: CNY (Chinese Yuan), formatted as ¥XXX万

## Don'ts

- ❌ Don't commit `.env` files
- ❌ Don't use `as any` or type assertions to bypass type errors
- ❌ Don't add unnecessary comments
- ❌ Don't create new UI components - use existing shadcn/ui
- ❌ Don't use `console.log` in production code
- ❌ Don't ignore ESLint errors
