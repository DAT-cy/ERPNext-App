src/
├── (app)/                      # App core
│   ├── App.tsx                # Root component
│   └── providers/             # Global providers
│       ├── AuthProvider.tsx
│       └── index.ts
│
├── api/                       # API layer
│   ├── config.ts             # API configuration, base URL, headers
│   ├── erp.api.ts            # ERPNext API endpoints
│   └── types.ts              # API type definitions
│
├── features/                  # Feature-based modules
│   ├── auth/                 # Authentication feature
│   │   ├── components/       # Feature-specific components
│   │   │   └── LoginForm.tsx
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useAuth.ts
│   │   ├── screens/         # Feature screens
│   │   │   └── LoginScreen.tsx
│   │   ├── services/        # Business logic & API calls
│   │   │   └── authService.ts
│   │   └── types/          # Feature-specific types
│   │       └── auth.types.ts
│   │
│   └── home/               # Home feature
│       ├── components/
│       ├── screens/
│       │   └── HomeScreen.tsx
│       └── types/
│
├── shared/                 # Shared resources
│   ├── components/        # Common UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Loading/
│   ├── constants/        # App constants
│   │   ├── config.ts
│   │   └── theme.ts
│   ├── hooks/           # Common hooks
│   │   └── useLoading.ts
│   ├── utils/          # Utility functions
│   │   ├── storage.ts
│   │   └── validation.ts
│   └── types/         # Common type definitions
│       └── common.ts
│
└── navigation/        # Navigation configuration
    ├── AppNavigator.tsx
    ├── AuthNavigator.tsx
    └── types.ts