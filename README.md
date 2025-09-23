erpnext-mobile-app/
├─ src/
│  ├─ app/                          # App shell & providers
│  │  ├─ App.tsx                    # Entry: bọc Providers, Navigation
│  │  ├─ navigation/                # React Navigation stacks/tabs
│  │  └─ providers/                 # AuthProvider, QueryClientProvider...
│  │     ├─ AuthProvider.tsx
│  │     └─ index.ts
│  │
│  ├─ config/                       # Cấu hình môi trường & hằng số
│  │  ├─ env.ts                     # BASE_URL, flags (đọc .env hoặc hard-code dev)
│  │  └─ constants.ts               # keys, routes, query-keys
│  │
│  ├─ api/                          # LỚP DATA chung cho ERPNext
│  │  ├─ http.ts                    # axios instance (timeout, headers)
│  │  ├─ erpClient.ts               # wrapper chung: login, logout, list/getDoc, callMethod
│  │  └─ types.ts                   # kiểu chung (ListArgs, Doc<T>, Error shape)
│  │
│  ├─ shared/                       # Tài nguyên dùng chung (không phụ thuộc feature)
│  │  ├─ ui/                        # Button, Input, Card, EmptyState...
│  │  ├─ hooks/                     # useDebounce, useOnline, usePagination...
│  │  ├─ lib/                       # format, date, currency, validators (zod/yup)
│  │  ├─ theme/                     # tokens, typography,    colors
│  │  └─ types/                     # kiểu nền tảng (UserSession, Paginated<T>…)
│  │
│  ├─ features/                     # MỖI FEATURE = mini-module tự quản
│  │  ├─ hr/
│  │  │  ├─ api/                    # gọi ERPNext cho HR (Leave Application, Employee…)
│  │  │  ├─ model/                  # types + schema (zod) của HR
│  │  │  ├─ hooks/                  # useGetEmployees, useApproveLeave...
│  │  │  ├─ ui/                     # components đặc thù HR (LeaveCard…)
│  │  │  └─ screens/                # HR screens (List, Detail, Create…)
│  │  ├─ stock/
│  │  ├─ sales/
│  │  └─ manufacturing/
│  │
│  ├─ pages/                        # Screen cấp route (nếu không muốn để trong features)
│  ├─ storage/                      # SecureStore/MMKV (sid, prefs…)
│  ├─ i18n/                         # đa ngôn ngữ
│  └─ utils/                        # tiện ích nhỏ (nếu chưa muốn đẩy vào shared/lib)
│
├─ assets/
├─ .env
├─ package.json
└─ README.md
