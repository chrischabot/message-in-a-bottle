# CLAUDE.md — Comprehensive Implementation Guide

**Project:** Message in a Bottle
**Type:** Telegram-style Messenger on Sui Blockchain
**Stack:** TypeScript, Expo (React Native), Next.js, Sui Stack Messaging SDK

This document provides a comprehensive implementation guide for building Message in a Bottle, including detailed feature specifications, technology decisions, code structures, testing strategies, and interaction patterns.

---

## Table of Contents

1. [Features Breakdown](#1-features-breakdown)
2. [Technology Stack & Decisions](#2-technology-stack--decisions)
3. [Code Architecture & Structure](#3-code-architecture--structure)
4. [Package Organization](#4-package-organization)
5. [Menu & Navigation Structure](#5-menu--navigation-structure)
6. [Configuration Management](#6-configuration-management)
7. [User Interactions & Flows](#7-user-interactions--flows)
8. [Component Testing Strategy](#8-component-testing-strategy)
9. [End-to-End Testing Strategy](#9-end-to-end-testing-strategy)
10. [Implementation Phases](#10-implementation-phases)

---

## 1. Features Breakdown

### 1.1 Core Features (MVP)

#### Authentication & Identity
- **Wallet Connection**
  - Support for all Sui wallets via Wallet Standard
  - Deep linking for mobile wallet connections
  - Session persistence across app restarts
  - Multi-account support with account switching

- **zkLogin Integration**
  - OAuth-based onboarding (Google, Apple, etc.)
  - Wallet address mapping without public linking
  - Optional upgrade path to full wallet control
  - Privacy-preserving identity management

- **Session Key Management**
  - Short-lived session keys for message operations
  - Automatic refresh before expiry
  - Secure key storage (Keychain/Keystore/LocalStorage)
  - Key rotation policies

#### Messaging Core
- **1:1 Direct Messages**
  - Text messages with rich formatting
  - Message threading and replies
  - Read receipts (delivered, read)
  - Typing indicators (stretch)
  - Message search within conversation

- **Group Chats**
  - Multi-member conversations (up to 200 members)
  - Group creation with member selection
  - Add/remove members (admin only)
  - Group info editing (name, avatar, description)
  - Leave group functionality
  - Member list with roles

- **Broadcast Channels**
  - One-to-many communication
  - Admin-only posting permissions
  - Subscriber-only reading
  - Channel info and statistics
  - Join/leave channel flows

#### Message Features
- **Message Types**
  - Text (plain, formatted)
  - Images (JPEG, PNG, WebP, HEIC)
  - Videos (MP4, MOV)
  - Documents (PDF, DOC, XLS, etc.)
  - Audio files
  - Voice notes (stretch)
  - Location sharing (stretch)

- **Message Actions**
  - Reply to message (quoted)
  - Forward to other chats
  - Edit message (with edited indicator)
  - Delete message (for self or everyone)
  - Copy message text
  - Multi-select for batch operations
  - Pin message to conversation
  - React with emoji

- **Message Metadata**
  - Timestamp (sent, delivered, read)
  - Edit history
  - Forwarded indicator
  - Reply chain visualization
  - Delivery status (pending, sent, failed)

#### Encryption & Security
- **End-to-End Encryption (Seal)**
  - Client-side encryption/decryption only
  - Per-message encryption keys
  - Seal policy enforcement
  - Key distribution via Sui objects
  - No plaintext on-chain or in transit

- **Attachment Encryption**
  - Encrypt before Walrus upload
  - Separate encryption keys per file
  - Thumbnail encryption
  - Progressive decryption for large files

#### Storage & Sync
- **Local Caching**
  - SQLite for mobile (expo-sqlite)
  - IndexedDB for web
  - Decrypted message cache
  - Media cache with size limits
  - Conversation metadata

- **Cloud Storage (Walrus)**
  - Encrypted attachment storage
  - Blob ID references on-chain
  - CDN-like retrieval
  - Automatic garbage collection
  - Redundancy and availability

- **Sync Engine**
  - Cursor-based pagination
  - Incremental sync on app resume
  - Conflict resolution for edits/deletes
  - Background sync scheduling
  - Offline queue for pending sends

#### Notifications
- **Push Notifications**
  - Mobile: Expo Notifications (APNs, FCM)
  - Web: Web Push API
  - New message alerts
  - Mention alerts
  - Reaction alerts
  - Muted conversation exceptions

- **Notification Content**
  - Generic alerts only (no plaintext)
  - "New message from @user"
  - Badge counts
  - Notification grouping by conversation
  - Tap-through to specific conversation

#### User Experience
- **Real-time Updates**
  - Polling-based sync (5-10s interval)
  - Optimistic UI updates
  - Loading states and skeletons
  - Retry logic for failures

- **Offline Support**
  - Read cached messages offline
  - Queue messages for sending
  - Offline indicator
  - Auto-send when reconnected

- **Performance**
  - Virtualized message lists
  - Lazy loading for media
  - Progressive image loading
  - Debounced search
  - Memory-efficient caching

### 1.2 Extended Features (Post-MVP)

#### Advanced Messaging
- **Voice & Video Calls**
  - WebRTC peer-to-peer calls
  - On-chain signaling objects
  - Call history and duration
  - Group voice chats (stretch)

- **Bot Integration**
  - Bot API for automated responses
  - Command system (/command)
  - Inline bots for content
  - Bot permissions and policies

#### Community Features
- **Discovery**
  - Public channel directory
  - Search by topic/category
  - Trending channels
  - Recommended channels

- **Advanced Moderation**
  - Admin tools (ban, mute, warn)
  - Message reporting
  - Content filtering
  - Spam detection
  - Auto-moderation rules

#### Platform Features
- **Multi-Device Sync**
  - Device key backup via Seal
  - Secure recovery flows
  - Device management UI
  - Session termination

- **Theming & Customization**
  - Light/dark themes
  - Accent color picker
  - Custom chat backgrounds
  - Font size adjustment
  - Bubble style variants

---

## 2. Technology Stack & Decisions

### 2.1 Core Technologies

#### Frontend Framework
**Decision: Expo (React Native) + React Native Web**

**Rationale:**
- Single TypeScript codebase for iOS, Android, and Web
- First-class TypeScript support
- Rich ecosystem of libraries and tools
- EAS Build for streamlined mobile builds
- Over-the-air updates via EAS Update
- Strong community and documentation
- Native performance with JavaScript flexibility

**Alternatives Considered:**
- Ionic React + Capacitor (web-first approach)
- NativeScript (direct native API access)
- Flutter (different language/ecosystem)

#### Web Framework
**Decision: Next.js 14+ (App Router)**

**Rationale:**
- Server-side rendering for SEO
- API routes for backend services
- Image optimization
- Built-in routing
- TypeScript support
- Production-ready optimizations
- Strong ecosystem integration

**Alternative:** Expo Web (simpler but less flexible)

#### UI Framework
**Decision: Tamagui**

**Rationale:**
- Universal components (native + web)
- Theme system with tokens
- Performance optimizations
- TypeScript-first
- Customizable design system
- Responsive utilities
- Animation support

**Alternatives:**
- NativeBase
- React Native Paper
- Custom component library

#### State Management
**Decision: Zustand + React Query**

**Rationale:**
- **Zustand:** Lightweight, simple, TypeScript-friendly for app state
- **React Query:** Perfect for server state (blockchain data), caching, and sync
- Minimal boilerplate
- DevTools support
- Easy testing

**Alternatives:**
- Redux Toolkit
- Jotai
- Recoil
- Context API only

### 2.2 Blockchain & Crypto Stack

#### Blockchain
**Sui Network**
- On-chain message metadata
- Channel and membership objects
- Capability-based access control
- GraphQL RPC/Indexer for queries
- Transaction sponsorship

#### Wallet Integration
**@mysten/dapp-kit + Wallet Standard**
- Universal wallet connection
- Support for all Sui wallets
- zkLogin integration
- Session key management
- Transaction building

#### Encryption
**Seal SDK**
- End-to-end encryption
- Client-side only decryption
- Policy enforcement
- Key management
- Session key support

#### Storage
**Walrus**
- Decentralized blob storage
- Encrypted attachment storage
- High availability
- Cost-effective
- CDN-like performance

#### Messaging
**Sui Stack Messaging SDK**
- Channel management
- Message sending/receiving
- Membership capabilities
- On-chain policies
- GraphQL integration

### 2.3 Development Tools

#### Monorepo
**Turborepo**
- Fast build system
- Intelligent caching
- Task pipelines
- Remote caching support
- Simple configuration

#### Package Manager
**pnpm**
- Efficient disk usage
- Fast installs
- Strict dependency resolution
- Workspace support
- Compatible with Turborepo

#### TypeScript
**TypeScript 5.x (strict mode)**
- Full type safety
- Enhanced IDE support
- Compile-time error detection
- Better refactoring
- Self-documenting code

#### Linting & Formatting
- **ESLint** with TypeScript plugin
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for pre-commit checks

#### Testing
- **Jest** for unit tests
- **React Testing Library** for component tests
- **Detox** for mobile E2E tests
- **Playwright** for web E2E tests
- **MSW** for API mocking

### 2.4 DevOps & CI/CD

#### Build & Deploy
- **EAS Build** for iOS/Android builds
- **EAS Submit** for store submissions
- **Vercel** or **Cloudflare Pages** for web hosting
- **GitHub Actions** for CI/CD

#### Monitoring & Analytics
- **Sentry** for error tracking
- **PostHog** or **Mixpanel** for product analytics
- **Custom logging** (no sensitive data)
- **Performance monitoring**

#### Environment Management
- **dotenv** for environment variables
- **Feature flags** for gradual rollouts
- **Environment-specific configs**
- **Secrets management** (EAS Secrets, Vercel Env)

---

## 3. Code Architecture & Structure

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer                            │
│  (Expo Mobile App, Next.js Web App)                         │
│  - Screens & Components                                     │
│  - Navigation & Routing                                     │
│  - Theme & Styling                                          │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                    Application Layer                        │
│  - State Management (Zustand)                               │
│  - Business Logic Hooks                                     │
│  - Data Fetching (React Query)                              │
│  - Validation (Zod)                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                     Service Layer                           │
│  - Messaging Provider (SDK Wrapper)                         │
│  - Wallet Provider                                          │
│  - Encryption Service (Seal)                                │
│  - Storage Service (Local Cache)                            │
│  - Sync Engine                                              │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  - Sui RPC & Indexer (GraphQL)                              │
│  - Walrus Storage                                           │
│  - Notification Service                                     │
│  - Push Relay Server                                        │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Design Patterns

#### Provider Pattern
Used for context sharing across components:
- `WalletProvider`: Wallet connection state
- `MessagingProvider`: Messaging SDK client
- `SessionKeyProvider`: Session key management
- `ThemeProvider`: Theme and styling
- `NotificationProvider`: Push notifications

#### Repository Pattern
Abstraction over data sources:
- `MessageRepository`: CRUD for messages
- `ChannelRepository`: CRUD for channels
- `UserRepository`: User profiles and settings
- `CacheRepository`: Local storage operations

#### Observer Pattern
For real-time updates:
- `SyncObserver`: Monitors chain for new messages
- `NotificationObserver`: Listens for notification events
- `ConnectionObserver`: Network status changes

#### Factory Pattern
For object creation:
- `MessageFactory`: Create message objects
- `ChannelFactory`: Create channel objects
- `NotificationFactory`: Create notification payloads

### 3.3 Data Flow

#### Message Send Flow
```
User Input (Composer)
  → Validation (Zod schema)
    → useMessaging.sendMessage()
      → Encrypt with Seal
        → [If attachment] Upload to Walrus
          → Build Sui transaction
            → Sign with session key
              → Submit to Sui
                → Optimistic UI update
                  → Background sync confirms
```

#### Message Receive Flow
```
Polling/Push Notification
  → GraphQL query (cursor-based)
    → New messages detected
      → Fetch from indexer
        → Decrypt with Seal
          → [If attachment] Fetch from Walrus
            → Cache locally
              → Update React Query cache
                → UI re-renders
```

#### Sync Flow
```
App Resume/Foreground
  → Load last cursor from cache
    → Query indexer with cursor
      → Fetch new messages
        → Decrypt batch
          → Merge with local cache
            → Update conversations
              → Trigger notifications
```

### 3.4 State Management Strategy

#### Global State (Zustand)
```typescript
// App-wide state
interface AppState {
  // Auth
  account: string | null;
  sessionKeyExpiry: number | null;

  // UI
  theme: 'light' | 'dark';
  activeConversationId: string | null;

  // Network
  isOnline: boolean;
  isSyncing: boolean;

  // Settings
  notificationsEnabled: boolean;
  mutedConversations: string[];
}
```

#### Server State (React Query)
```typescript
// Blockchain & external data
- useChannels(): Channel[]
- useMessages(channelId): Message[]
- useChannel(channelId): Channel
- useProfile(address): UserProfile
```

#### Local State (useState/useReducer)
```typescript
// Component-specific state
- Form inputs
- Modal visibility
- Scroll position
- Selection state
```

### 3.5 Error Handling Strategy

#### Error Boundaries
- Top-level error boundary for crash recovery
- Feature-specific boundaries for graceful degradation
- Error reporting to Sentry

#### Error Types
```typescript
enum ErrorCode {
  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Auth
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SIGNATURE_REJECTED = 'SIGNATURE_REJECTED',

  // Messaging
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  MESSAGE_SEND_FAILED = 'MESSAGE_SEND_FAILED',

  // Storage
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  CACHE_ERROR = 'CACHE_ERROR',

  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

class AppError extends Error {
  code: ErrorCode;
  originalError?: Error;
  userMessage: string;
  retryable: boolean;
}
```

#### Retry Logic
- Exponential backoff for network errors
- Maximum retry attempts (3-5)
- User notification after max retries
- Manual retry option

---

## 4. Package Organization

### 4.1 Monorepo Structure

```
message-in-a-bottle/
├── apps/
│   ├── mobile/                 # Expo app (iOS & Android)
│   │   ├── app/               # App router screens
│   │   ├── components/        # App-specific components
│   │   ├── hooks/             # App-specific hooks
│   │   ├── app.json           # Expo config
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                   # Next.js app
│       ├── app/               # App router
│       ├── components/        # Web-specific components
│       ├── public/            # Static assets
│       ├── next.config.js
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── ui/                    # Shared UI components
│   │   ├── src/
│   │   │   ├── components/   # Reusable components
│   │   │   ├── theme/        # Theme configuration
│   │   │   ├── tokens/       # Design tokens
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── messaging/             # Messaging SDK wrapper
│   │   ├── src/
│   │   │   ├── providers/    # React providers
│   │   │   ├── hooks/        # Messaging hooks
│   │   │   ├── services/     # SDK services
│   │   │   ├── types/        # Type definitions
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared/                # Shared utilities
│   │   ├── src/
│   │   │   ├── types/        # Shared types (Zod schemas)
│   │   │   ├── utils/        # Utility functions
│   │   │   ├── constants/    # Constants
│   │   │   ├── config/       # Configuration
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── indexer/               # GraphQL queries & fragments
│   │   ├── src/
│   │   │   ├── queries/      # GraphQL queries
│   │   │   ├── fragments/    # GraphQL fragments
│   │   │   ├── client.ts     # GraphQL client setup
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── storage/               # Storage abstraction
│       ├── src/
│       │   ├── cache/        # Local cache (SQLite/IndexedDB)
│       │   ├── walrus/       # Walrus client
│       │   ├── types/        # Storage types
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── services/                  # Backend services (optional)
│   └── push-relay/           # Push notification relay
│       ├── src/
│       ├── Dockerfile
│       └── package.json
│
├── .github/
│   └── workflows/            # CI/CD workflows
│       ├── ci.yml
│       ├── mobile-build.yml
│       └── web-deploy.yml
│
├── turbo.json                # Turborepo config
├── package.json              # Root package.json
├── pnpm-workspace.yaml       # pnpm workspace config
├── tsconfig.json             # Base TypeScript config
├── .eslintrc.js              # ESLint config
├── .prettierrc.js            # Prettier config
└── README.md
```

### 4.2 Package Details

#### `@miab/ui`
Shared UI component library.

**Exports:**
```typescript
// Components
export { ChatBubble } from './components/ChatBubble';
export { MessageComposer } from './components/MessageComposer';
export { ConversationList } from './components/ConversationList';
export { Avatar } from './components/Avatar';
export { Button } from './components/Button';
export { Input } from './components/Input';
// ... more components

// Theme
export { ThemeProvider, useTheme } from './theme/provider';
export { lightTheme, darkTheme } from './theme/themes';
export { tokens } from './tokens';
```

**Key Components:**
- `ChatBubble`: Message bubble with variants (sent/received)
- `MessageComposer`: Text input with attachments
- `ConversationList`: List of conversations with preview
- `ConversationHeader`: Conversation title and actions
- `MessageList`: Virtualized message list
- `ReactionPicker`: Emoji picker for reactions
- `AttachmentPreview`: Preview for images/videos/files
- `UserAvatar`: User avatar with status indicator
- `TypingIndicator`: Animated typing indicator

#### `@miab/messaging`
Messaging SDK wrapper and providers.

**Exports:**
```typescript
// Providers
export { MessagingProvider } from './providers/MessagingProvider';
export { SessionKeyProvider } from './providers/SessionKeyProvider';
export { WalrusProvider } from './providers/WalrusProvider';

// Hooks
export { useMessaging } from './hooks/useMessaging';
export { useChannel } from './hooks/useChannel';
export { useMessages } from './hooks/useMessages';
export { useSendMessage } from './hooks/useSendMessage';
export { useAttachment } from './hooks/useAttachment';

// Services
export { EncryptionService } from './services/encryption';
export { SyncService } from './services/sync';

// Types
export * from './types';
```

**Key Services:**
- `MessagingClient`: Wrapper around Sui Messaging SDK
- `EncryptionService`: Seal encryption/decryption
- `WalrusService`: File upload/download
- `SyncService`: Cursor-based sync engine
- `SessionKeyService`: Session key management

#### `@miab/shared`
Shared types, utilities, and configuration.

**Exports:**
```typescript
// Types (Zod schemas)
export { channelSchema, messageSchema, userSchema } from './types/schemas';
export type { Channel, Message, User } from './types';

// Utils
export { formatTimestamp } from './utils/date';
export { validateAddress } from './utils/validation';
export { truncateAddress } from './utils/format';

// Config
export { config } from './config';
export { featureFlags } from './config/features';

// Constants
export { MESSAGE_TYPES, CHANNEL_TYPES } from './constants';
```

**Key Modules:**
- `types/`: Zod schemas and TypeScript types
- `utils/`: Utility functions (formatting, validation, etc.)
- `config/`: Environment-based configuration
- `constants/`: App-wide constants

#### `@miab/indexer`
GraphQL queries and client configuration.

**Exports:**
```typescript
// Client
export { createClient } from './client';

// Queries
export { GET_CHANNELS, GET_MESSAGES, GET_CHANNEL_MEMBERS } from './queries';

// Fragments
export { MessageFragment, ChannelFragment } from './fragments';

// Hooks (React Query integration)
export { useChannelsQuery, useMessagesQuery } from './hooks';
```

**Key Files:**
- `queries/channels.graphql.ts`: Channel queries
- `queries/messages.graphql.ts`: Message queries
- `queries/users.graphql.ts`: User/profile queries
- `fragments/`: Reusable GraphQL fragments

#### `@miab/storage`
Storage abstraction layer.

**Exports:**
```typescript
// Cache
export { CacheService } from './cache/CacheService';
export { useSQLiteCache } from './cache/sqlite';
export { useIndexedDBCache } from './cache/indexeddb';

// Walrus
export { WalrusClient } from './walrus/client';
export { uploadEncrypted, downloadEncrypted } from './walrus/helpers';
```

**Key Services:**
- `CacheService`: Unified cache interface
- `SQLiteCache`: SQLite implementation (mobile)
- `IndexedDBCache`: IndexedDB implementation (web)
- `WalrusClient`: Walrus upload/download

---

## 5. Menu & Navigation Structure

### 5.1 Navigation Hierarchy

```
App
├── Auth Stack (unauthenticated)
│   ├── Welcome
│   ├── Connect Wallet
│   └── zkLogin
│
└── Main Stack (authenticated)
    ├── Tabs
    │   ├── Chats Tab
    │   │   ├── Conversation List
    │   │   ├── Search
    │   │   └── Folders (stretch)
    │   │
    │   ├── Channels Tab
    │   │   ├── Channel Directory
    │   │   ├── Subscribed Channels
    │   │   └── Channel Discovery
    │   │
    │   └── Settings Tab
    │       ├── Profile
    │       ├── Privacy
    │       ├── Notifications
    │       ├── Data & Storage
    │       ├── Appearance
    │       └── About
    │
    └── Modals (over tabs)
        ├── Conversation
        │   ├── Thread View
        │   ├── Conversation Info
        │   ├── Member List
        │   └── Media Gallery
        │
        ├── New Message
        │   ├── Select Contact
        │   ├── New Group
        │   └── New Channel
        │
        ├── Profile View
        ├── Image Viewer
        ├── File Viewer
        └── Search Results
```

### 5.2 Screen Specifications

#### Welcome Screen
- **Purpose:** First-time user onboarding
- **Elements:**
  - App logo and tagline
  - Feature highlights (E2EE, decentralized, etc.)
  - "Connect Wallet" button
  - "Sign in with zkLogin" button
  - Terms of service and privacy policy links
- **Navigation:**
  - Connect Wallet → Wallet Connection Screen
  - zkLogin → zkLogin Flow

#### Conversation List Screen
- **Purpose:** Main hub for all conversations
- **Elements:**
  - Search bar (fixed at top)
  - Filter chips (All, Unread, Groups, Channels)
  - List of conversations with:
    - Avatar (user/group)
    - Name
    - Last message preview
    - Timestamp
    - Unread badge
    - Pin indicator
    - Mute indicator
  - Floating Action Button: "New Message"
  - Pull-to-refresh
- **Actions:**
  - Tap conversation → Open Thread
  - Long-press → Quick actions (pin, mute, delete, mark read)
  - Swipe left → Quick actions
  - Search → Search Screen
  - FAB → New Message Screen
- **Navigation:**
  - Tap → Conversation Thread
  - FAB → New Message Modal

#### Conversation Thread Screen
- **Purpose:** View and send messages in a conversation
- **Elements:**
  - **Header:**
    - Back button
    - Avatar
    - Conversation name
    - Online status / member count
    - Call button (stretch)
    - More menu (info, mute, search)
  - **Message List:**
    - Date dividers
    - Message bubbles (sent/received)
    - Timestamps
    - Read receipts
    - Reactions
    - Reply indicators
    - Media (images, videos, files)
    - System messages
  - **Composer:**
    - Text input (multi-line)
    - Emoji button
    - Attachment button
    - Send button
    - Reply bar (when replying)
    - Edit bar (when editing)
- **Actions:**
  - Long-press message → Context menu (reply, forward, edit, delete, copy, react, select)
  - Tap media → Full screen viewer
  - Tap reply → Scroll to original
  - Tap user avatar → User profile
  - Pull-to-refresh → Load older messages
- **Navigation:**
  - Back → Conversation List
  - More → Conversation Info
  - Media → Media Viewer

#### Conversation Info Screen
- **Purpose:** View and manage conversation details
- **Elements:**
  - **Group/Channel Info:**
    - Large avatar
    - Name
    - Description
    - Member count
    - Created date
  - **Members Section:**
    - Member list with roles
    - Add member button (if admin)
  - **Media Section:**
    - Shared media grid
    - Shared files list
  - **Actions Section:**
    - Mute notifications
    - Pin conversation
    - Search in conversation
    - Export chat (stretch)
  - **Danger Zone:**
    - Leave group
    - Delete conversation
- **Actions:**
  - Edit info (if admin)
  - Add/remove members (if admin)
  - View member profile
- **Navigation:**
  - Back → Conversation Thread

#### New Message Screen
- **Purpose:** Start a new conversation
- **Elements:**
  - Search bar (contact search)
  - Contact list with:
    - Avatar
    - Name
    - Address (truncated)
    - Last seen (if available)
  - Tabs:
    - Contacts
    - New Group
    - New Channel
  - Selected contacts (when creating group)
  - "Next" button (for group creation)
- **Actions:**
  - Tap contact → Open DM
  - Select multiple → Enable group creation
  - Next (group) → Group details screen
- **Navigation:**
  - Cancel → Back to Conversation List
  - Select contact → Conversation Thread
  - New Group → Group Creation Flow

#### Settings Screen
- **Purpose:** App configuration and preferences
- **Sections:**
  - **Account:**
    - Profile (avatar, name, bio)
    - Username/handle
    - Connected wallet address
    - Devices
  - **Privacy & Security:**
    - Read receipts toggle
    - Last seen toggle
    - Profile photo visibility
    - Blocked users
  - **Notifications:**
    - Enable/disable
    - Sound
    - Vibration
    - In-app notifications
    - Muted conversations list
  - **Data & Storage:**
    - Cache size
    - Clear cache
    - Auto-download media
    - Storage usage breakdown
  - **Appearance:**
    - Theme (light/dark/auto)
    - Accent color
    - Chat background
    - Font size
  - **About:**
    - Version
    - Terms of service
    - Privacy policy
    - Licenses
    - Help & support

### 5.3 Navigation Implementation

#### Mobile (Expo Router)
```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

// app/(tabs)/_layout.tsx
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="chats" options={{ title: 'Chats' }} />
      <Tabs.Screen name="channels" options={{ title: 'Channels' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```

#### Web (Next.js App Router)
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

// app/(main)/chats/page.tsx
export default function ChatsPage() {
  return <ConversationListScreen />;
}
```

---

## 6. Configuration Management

### 6.1 Environment Variables

#### Common Variables
```bash
# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet|mainnet
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io
NEXT_PUBLIC_SUI_GRAPHQL_URL=https://sui-testnet.mystenlabs.com/graphql

# Walrus
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# App Config
NEXT_PUBLIC_APP_NAME=Message in a Bottle
NEXT_PUBLIC_APP_URL=https://app.messageinabottle.io

# Feature Flags
NEXT_PUBLIC_ENABLE_ZKLOGIN=true
NEXT_PUBLIC_ENABLE_SPONSORED_TX=true
NEXT_PUBLIC_ENABLE_VOICE_NOTES=false

# Monitoring (server-side only)
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
```

#### Mobile-Specific (app.json)
```json
{
  "expo": {
    "extra": {
      "suiNetwork": "testnet",
      "suiRpcUrl": "https://fullnode.testnet.sui.io",
      "eas": {
        "projectId": "..."
      }
    }
  }
}
```

### 6.2 Feature Flags

```typescript
// packages/shared/src/config/features.ts
export const featureFlags = {
  // Core features
  zkLogin: process.env.NEXT_PUBLIC_ENABLE_ZKLOGIN === 'true',
  sponsoredTransactions: process.env.NEXT_PUBLIC_ENABLE_SPONSORED_TX === 'true',

  // Messaging features
  voiceNotes: process.env.NEXT_PUBLIC_ENABLE_VOICE_NOTES === 'true',
  videoCalls: process.env.NEXT_PUBLIC_ENABLE_VIDEO_CALLS === 'true',
  messageEditing: true,
  messageReactions: true,

  // Performance
  virtualizedLists: true,
  imageOptimization: true,

  // Experimental
  multiDeviceSync: false,
  botIntegration: false,
} as const;
```

### 6.3 App Configuration

```typescript
// packages/shared/src/config/index.ts
export const config = {
  app: {
    name: 'Message in a Bottle',
    version: '1.0.0',
    buildNumber: 1,
  },

  sui: {
    network: process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet',
    rpcUrl: process.env.NEXT_PUBLIC_SUI_RPC_URL,
    graphqlUrl: process.env.NEXT_PUBLIC_SUI_GRAPHQL_URL,
    packageId: '0x...', // Deployed package ID
  },

  walrus: {
    publisherUrl: process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL,
    aggregatorUrl: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL,
    maxFileSize: 100 * 1024 * 1024, // 100MB
  },

  messaging: {
    maxMessageLength: 4096,
    maxMembers: 200,
    sessionKeyLifetime: 7 * 24 * 60 * 60 * 1000, // 7 days
    syncInterval: 10000, // 10s
    retryAttempts: 3,
  },

  cache: {
    maxMessages: 1000,
    maxMediaSize: 500 * 1024 * 1024, // 500MB
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
  },

  ui: {
    messagePageSize: 50,
    previewLineLength: 100,
    throttleDelay: 300,
  },
} as const;
```

### 6.4 Theme Configuration

```typescript
// packages/ui/src/theme/tokens.ts
export const tokens = {
  colors: {
    // Brand
    primary: '#0088CC',
    primaryDark: '#006699',
    accent: '#FF6B00',

    // UI
    background: '#FFFFFF',
    surface: '#F5F5F5',
    border: '#E0E0E0',

    // Text
    text: '#000000',
    textSecondary: '#757575',
    textInverse: '#FFFFFF',

    // Message bubbles
    bubbleSent: '#DCF8C6',
    bubbleReceived: '#FFFFFF',

    // Status
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',

    // Dark mode overrides
    dark: {
      background: '#0E1621',
      surface: '#1C2733',
      border: '#2E3A47',
      text: '#FFFFFF',
      textSecondary: '#8B96A5',
      bubbleSent: '#0B5F3E',
      bubbleReceived: '#1C2733',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },

  typography: {
    fontFamily: {
      regular: 'Inter-Regular',
      medium: 'Inter-Medium',
      semiBold: 'Inter-SemiBold',
      bold: 'Inter-Bold',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};
```

---

## 7. User Interactions & Flows

### 7.1 Onboarding Flow

```
┌─────────────────────┐
│  Welcome Screen     │
│  - App intro        │
│  - Feature preview  │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
┌────▼─────┐  ┌─▼─────────┐
│  Wallet  │  │  zkLogin  │
│  Connect │  │  Sign In  │
└────┬─────┘  └─┬─────────┘
     │          │
     └────┬─────┘
          │
┌─────────▼──────────┐
│  Session Key Setup │
│  - Request sig     │
│  - Create session  │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│  Profile Setup     │
│  - Avatar          │
│  - Username        │
│  - Bio (optional)  │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│  Notification      │
│  Permission        │
└─────────┬──────────┘
          │
┌─────────▼──────────┐
│  Conversation List │
│  (Empty state)     │
└────────────────────┘
```

**Implementation:**
```typescript
// apps/mobile/app/onboarding/index.tsx
export default function OnboardingFlow() {
  const [step, setStep] = useState<'welcome' | 'auth' | 'session' | 'profile' | 'notifications'>('welcome');

  // Step-by-step progression
  // Each step validates before proceeding
  // Can skip optional steps
}
```

### 7.2 Message Send Flow

```
User types message
  │
  ▼
Composer validates input
  │
  ▼
User taps Send button
  │
  ▼
useSendMessage hook
  │
  ├─► Optimistic update (instant UI)
  │
  ├─► Validate message
  │     └─► [Invalid] → Show error, revert UI
  │
  ├─► Encrypt with Seal
  │     └─► [Failed] → Show error, revert UI
  │
  ├─► Build transaction
  │
  ├─► Sign with session key
  │     └─► [Session expired] → Refresh → Retry
  │     └─► [User rejected] → Cancel, revert UI
  │
  ├─► Submit to Sui
  │     └─► [Network error] → Retry with backoff
  │     └─► [Gas error] → Suggest sponsored tx
  │
  ├─► Transaction confirmed
  │
  └─► Background sync validates
        └─► [Mismatch] → Re-sync
        └─► [Success] → Update UI with confirmed state
```

**Implementation:**
```typescript
// packages/messaging/src/hooks/useSendMessage.ts
export function useSendMessage() {
  const messaging = useMessaging();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelId, content, attachments }) => {
      // 1. Optimistic update
      const tempId = generateTempId();
      queryClient.setQueryData(['messages', channelId], (old) => [...old, {
        id: tempId,
        status: 'pending',
        content,
      }]);

      try {
        // 2. Encrypt
        const encrypted = await messaging.encrypt(content);

        // 3. Upload attachments (if any)
        const attachmentRefs = await Promise.all(
          attachments.map(a => uploadAttachment(a))
        );

        // 4. Send
        const result = await messaging.sendMessage(channelId, {
          encrypted,
          attachments: attachmentRefs,
        });

        // 5. Replace temp with real message
        queryClient.setQueryData(['messages', channelId], (old) =>
          old.map(m => m.id === tempId ? { ...m, ...result, status: 'sent' } : m)
        );

        return result;
      } catch (error) {
        // Revert optimistic update
        queryClient.setQueryData(['messages', channelId], (old) =>
          old.map(m => m.id === tempId ? { ...m, status: 'failed' } : m)
        );
        throw error;
      }
    },

    onError: (error) => {
      // Show user-friendly error
      handleError(error);
    },
  });
}
```

### 7.3 New Group Creation Flow

```
User taps "New Group"
  │
  ▼
Select Members Screen
  │
  ├─► Search contacts
  │
  ├─► Select 2+ members
  │
  └─► Tap "Next"
        │
        ▼
Group Details Screen
  │
  ├─► Upload group avatar (optional)
  │
  ├─► Enter group name (required)
  │
  ├─► Enter description (optional)
  │
  └─► Tap "Create"
        │
        ▼
Create Channel Flow
  │
  ├─► Create channel on Sui
  │
  ├─► Mint creator cap
  │
  ├─► Mint member caps for selected members
  │
  ├─► Send invitation messages
  │
  └─► Navigate to group thread
```

**Implementation:**
```typescript
// apps/mobile/app/new-group/index.tsx
export default function NewGroupFlow() {
  const [members, setMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const createChannel = useCreateChannel();

  async function handleCreate() {
    await createChannel.mutate({
      kind: 'group',
      name: groupName,
      members,
      avatar,
    });

    router.push(`/chat/${result.channelId}`);
  }
}
```

### 7.4 Attachment Upload Flow

```
User taps attachment button
  │
  ▼
Show attachment options
  │
  ├─► Camera → Capture photo/video
  ├─► Gallery → Select media
  ├─► Documents → Select file
  └─► Location → Share location (stretch)
        │
        ▼
Preview attachment
  │
  ├─► [Image] → Show with crop/edit options
  ├─► [Video] → Show with trim options
  └─► [File] → Show name and size
        │
        ▼
User adds caption (optional)
        │
        ▼
User taps Send
        │
        ▼
Attachment processing
  │
  ├─► Validate size/type
  │     └─► [Too large] → Compress or reject
  │
  ├─► Generate thumbnail (images/videos)
  │
  ├─► Encrypt with Seal
  │
  ├─► Upload to Walrus
  │     ├─► Show progress bar
  │     └─► Allow cancellation
  │
  ├─► Store Walrus blob ID + metadata
  │
  └─► Send message with attachment reference
```

**Implementation:**
```typescript
// packages/messaging/src/hooks/useAttachment.ts
export function useAttachment() {
  const [progress, setProgress] = useState(0);

  async function uploadAttachment(file: File | Asset) {
    // 1. Validate
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File too large');
    }

    // 2. Generate thumbnail
    const thumbnail = await generateThumbnail(file);

    // 3. Encrypt
    const { encrypted, key } = await encryptFile(file);
    const { encryptedThumb, thumbKey } = await encryptFile(thumbnail);

    // 4. Upload to Walrus
    const blobId = await walrusClient.upload(encrypted, {
      onProgress: (p) => setProgress(p),
    });

    const thumbBlobId = await walrusClient.upload(encryptedThumb);

    // 5. Return reference
    return {
      type: file.type,
      blobId,
      thumbnailBlobId: thumbBlobId,
      size: file.size,
      encryptionKey: key,
      thumbnailKey: thumbKey,
    };
  }

  return { uploadAttachment, progress };
}
```

### 7.5 Message Context Menu Flow

```
User long-presses message
  │
  ▼
Context menu appears
  │
  ├─► Reply → Set reply target, focus composer
  │
  ├─► Forward
  │     └─► Select conversations → Confirm → Send
  │
  ├─► Edit (if own message)
  │     └─► Populate composer → Edit → Save
  │
  ├─► Delete
  │     └─► Confirm → Delete for self or everyone
  │
  ├─► Copy text → Copy to clipboard
  │
  ├─► React → Show emoji picker → Add reaction
  │
  ├─► Select → Enter selection mode
  │     └─► Select multiple → Batch actions
  │
  └─► Info → Show message details
        (Sender, timestamp, edit history, receipts)
```

### 7.6 Notification Flow

```
New message arrives on-chain
  │
  ▼
Push Relay detects event
  │
  ▼
Send push notification
  │
  ├─► [App in foreground]
  │     └─► In-app banner notification
  │           └─► Tap → Navigate to conversation
  │
  ├─► [App in background]
  │     └─► System notification
  │           └─► Tap → Open app → Navigate to conversation
  │
  └─► [App killed]
        └─► System notification
              └─► Tap → Launch app → Navigate to conversation
```

**Implementation:**
```typescript
// packages/messaging/src/services/notifications.ts
export class NotificationService {
  async initialize() {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === 'granted') {
      // Get push token
      const token = await Notifications.getExpoPushTokenAsync();

      // Register with relay
      await this.registerDevice(token);
    }
  }

  async handleNotification(notification: Notification) {
    // Parse notification data
    const { channelId, messageId } = notification.data;

    // Navigate to conversation
    router.push(`/chat/${channelId}?highlight=${messageId}`);
  }
}
```

---

## 8. Component Testing Strategy

### 8.1 Testing Philosophy

- **Unit Tests:** Test individual functions and hooks in isolation
- **Component Tests:** Test UI components with React Testing Library
- **Integration Tests:** Test feature workflows with mocked dependencies
- **E2E Tests:** Test complete user journeys (see section 9)

### 8.2 Unit Testing

#### What to Test
- Utility functions (formatting, validation, etc.)
- Custom hooks (useMessaging, useSendMessage, etc.)
- Service classes (EncryptionService, SyncService, etc.)
- Redux/Zustand stores

#### Testing Pattern
```typescript
// packages/shared/src/utils/__tests__/format.test.ts
import { truncateAddress, formatTimestamp } from '../format';

describe('truncateAddress', () => {
  it('should truncate long addresses', () => {
    const address = '0x1234567890abcdef1234567890abcdef';
    expect(truncateAddress(address)).toBe('0x1234...cdef');
  });

  it('should handle short addresses', () => {
    const address = '0x123';
    expect(truncateAddress(address)).toBe('0x123');
  });
});

describe('formatTimestamp', () => {
  it('should format relative time', () => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    expect(formatTimestamp(oneHourAgo)).toBe('1h ago');
  });

  it('should format absolute time for old messages', () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;

    expect(formatTimestamp(twoDaysAgo)).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});
```

#### Hook Testing
```typescript
// packages/messaging/src/hooks/__tests__/useSendMessage.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useSendMessage } from '../useSendMessage';

// Mock providers
const wrapper = ({ children }) => (
  <MessagingProvider>
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  </MessagingProvider>
);

describe('useSendMessage', () => {
  it('should send a message successfully', async () => {
    const { result } = renderHook(() => useSendMessage(), { wrapper });

    act(() => {
      result.current.mutate({
        channelId: 'test-channel',
        content: 'Hello world',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({
      channelId: 'test-channel',
      content: 'Hello world',
    });
  });

  it('should handle encryption failure', async () => {
    // Mock encryption failure
    mockEncrypt.mockRejectedValueOnce(new Error('Encryption failed'));

    const { result } = renderHook(() => useSendMessage(), { wrapper });

    act(() => {
      result.current.mutate({
        channelId: 'test-channel',
        content: 'Hello world',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      code: ErrorCode.ENCRYPTION_FAILED,
    });
  });
});
```

### 8.3 Component Testing

#### What to Test
- Rendering with different props
- User interactions (clicks, inputs, etc.)
- Conditional rendering
- Accessibility

#### Testing Pattern
```typescript
// packages/ui/src/components/__tests__/ChatBubble.test.tsx
import { render, screen } from '@testing-library/react-native';
import { ChatBubble } from '../ChatBubble';

describe('ChatBubble', () => {
  it('should render message content', () => {
    render(<ChatBubble mine={false}>Hello world</ChatBubble>);

    expect(screen.getByText('Hello world')).toBeTruthy();
  });

  it('should apply sent style for own messages', () => {
    const { getByTestId } = render(
      <ChatBubble mine={true} testID="bubble">
        Hello
      </ChatBubble>
    );

    const bubble = getByTestId('bubble');
    expect(bubble.props.style).toMatchObject({
      alignSelf: 'flex-end',
      backgroundColor: '#DCF8C6',
    });
  });

  it('should apply received style for others messages', () => {
    const { getByTestId } = render(
      <ChatBubble mine={false} testID="bubble">
        Hello
      </ChatBubble>
    );

    const bubble = getByTestId('bubble');
    expect(bubble.props.style).toMatchObject({
      alignSelf: 'flex-start',
      backgroundColor: '#FFFFFF',
    });
  });
});
```

#### Interactive Component Testing
```typescript
// packages/ui/src/components/__tests__/MessageComposer.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { MessageComposer } from '../MessageComposer';

describe('MessageComposer', () => {
  it('should call onSend when send button is pressed', () => {
    const onSend = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <MessageComposer onSend={onSend} />
    );

    const input = getByPlaceholderText('Type a message...');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'Hello world');
    fireEvent.press(sendButton);

    expect(onSend).toHaveBeenCalledWith('Hello world');
  });

  it('should disable send button when input is empty', () => {
    const { getByTestId } = render(<MessageComposer onSend={jest.fn()} />);

    const sendButton = getByTestId('send-button');
    expect(sendButton.props.disabled).toBe(true);
  });

  it('should clear input after sending', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <MessageComposer onSend={jest.fn()} />
    );

    const input = getByPlaceholderText('Type a message...');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(input, 'Hello');
    fireEvent.press(sendButton);

    expect(input.props.value).toBe('');
  });
});
```

### 8.4 Integration Testing

#### What to Test
- Feature workflows (send message, create group, etc.)
- Provider integration
- API mocking with MSW

#### Testing Pattern
```typescript
// apps/mobile/__tests__/integration/send-message.test.tsx
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ConversationThread } from '../../app/chat/[id]';

const server = setupServer(
  rest.post('/api/messages', (req, res, ctx) => {
    return res(ctx.json({
      id: 'msg-123',
      content: 'Hello world',
      createdAt: new Date().toISOString(),
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Send Message Integration', () => {
  it('should complete full send message flow', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <TestProviders>
        <ConversationThread channelId="test-channel" />
      </TestProviders>
    );

    // Type message
    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, 'Hello world');

    // Send message
    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    // Verify optimistic update
    expect(getByText('Hello world')).toBeTruthy();

    // Wait for confirmation
    await waitFor(() => {
      const message = getByText('Hello world');
      expect(message.props.testID).toContain('confirmed');
    });
  });

  it('should handle send failure with retry', async () => {
    // Mock failure
    server.use(
      rest.post('/api/messages', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { getByPlaceholderText, getByTestId, getByText } = render(
      <TestProviders>
        <ConversationThread channelId="test-channel" />
      </TestProviders>
    );

    // Send message
    const input = getByPlaceholderText('Type a message...');
    fireEvent.changeText(input, 'Hello world');
    fireEvent.press(getByTestId('send-button'));

    // Wait for error state
    await waitFor(() => {
      expect(getByText('Failed to send')).toBeTruthy();
    });

    // Mock success for retry
    server.use(
      rest.post('/api/messages', (req, res, ctx) => {
        return res(ctx.json({ id: 'msg-123', content: 'Hello world' }));
      })
    );

    // Retry
    const retryButton = getByText('Retry');
    fireEvent.press(retryButton);

    // Verify success
    await waitFor(() => {
      const message = getByText('Hello world');
      expect(message.props.testID).toContain('confirmed');
    });
  });
});
```

### 8.5 Test Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Component Tests:** 70%+ coverage for UI package
- **Integration Tests:** Critical paths covered
- **E2E Tests:** Happy paths + edge cases

### 8.6 Continuous Testing

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:unit --coverage

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  component-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - run: pnpm install
      - run: pnpm test:component

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - run: pnpm install
      - run: pnpm test:integration
```

---

## 9. End-to-End Testing Strategy

### 9.1 E2E Testing Philosophy

- Test critical user journeys from start to finish
- Test on real devices/browsers when possible
- Test both happy paths and error scenarios
- Minimize test brittleness with good selectors
- Run on CI for every PR

### 9.2 E2E Test Framework

#### Mobile: Detox
```typescript
// apps/mobile/e2e/config.json
{
  "testRunner": "jest",
  "runnerConfig": "e2e/jest.config.js",
  "apps": {
    "ios": {
      "type": "ios.app",
      "binaryPath": "ios/build/Build/Products/Debug-iphonesimulator/MIAB.app",
      "build": "xcodebuild -workspace ios/MIAB.xcworkspace -scheme MIAB -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build"
    },
    "android": {
      "type": "android.apk",
      "binaryPath": "android/app/build/outputs/apk/debug/app-debug.apk",
      "build": "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug"
    }
  },
  "devices": {
    "simulator": {
      "type": "ios.simulator",
      "device": {
        "type": "iPhone 14"
      }
    },
    "emulator": {
      "type": "android.emulator",
      "device": {
        "avdName": "Pixel_5_API_31"
      }
    }
  }
}
```

#### Web: Playwright
```typescript
// apps/web/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

### 9.3 Test Scenarios

#### Scenario 1: Complete Onboarding & First Message

**Mobile (Detox):**
```typescript
// apps/mobile/e2e/onboarding.e2e.ts
describe('Onboarding & First Message', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  it('should complete onboarding and send first message', async () => {
    // 1. Welcome screen
    await expect(element(by.text('Welcome to Message in a Bottle'))).toBeVisible();
    await element(by.id('connect-wallet-button')).tap();

    // 2. Connect wallet (mock)
    await element(by.id('wallet-sui-wallet')).tap();
    await element(by.id('wallet-approve')).tap();

    // 3. Session key setup
    await waitFor(element(by.text('Setting up secure session...')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('sign-session-button')).tap();

    // 4. Profile setup
    await element(by.id('username-input')).typeText('TestUser');
    await element(by.id('continue-button')).tap();

    // 5. Notification permission
    await element(by.id('enable-notifications')).tap();

    // 6. Empty state
    await expect(element(by.text('No conversations yet'))).toBeVisible();

    // 7. New message
    await element(by.id('new-message-fab')).tap();
    await element(by.id('contact-search')).typeText('0x123...abc');
    await element(by.id('contact-0x123')).tap();

    // 8. Send message
    await element(by.id('message-composer')).typeText('Hello from E2E test!');
    await element(by.id('send-button')).tap();

    // 9. Verify message sent
    await expect(element(by.text('Hello from E2E test!'))).toBeVisible();
    await expect(element(by.id('message-status-sent'))).toBeVisible();
  });
});
```

**Web (Playwright):**
```typescript
// apps/web/e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';

test('complete onboarding and send first message', async ({ page }) => {
  // 1. Navigate to app
  await page.goto('/');

  // 2. Welcome screen
  await expect(page.getByText('Welcome to Message in a Bottle')).toBeVisible();
  await page.getByRole('button', { name: 'Connect Wallet' }).click();

  // 3. Connect wallet (mock)
  await page.getByTestId('wallet-sui-wallet').click();
  await page.getByRole('button', { name: 'Approve' }).click();

  // 4. Session key setup
  await expect(page.getByText('Setting up secure session...')).toBeVisible();
  await page.getByRole('button', { name: 'Sign' }).click();

  // 5. Profile setup
  await page.getByLabel('Username').fill('TestUser');
  await page.getByRole('button', { name: 'Continue' }).click();

  // 6. Empty state
  await expect(page.getByText('No conversations yet')).toBeVisible();

  // 7. New message
  await page.getByTestId('new-message-fab').click();
  await page.getByPlaceholder('Search contacts').fill('0x123...abc');
  await page.getByTestId('contact-0x123').click();

  // 8. Send message
  await page.getByPlaceholder('Type a message...').fill('Hello from E2E test!');
  await page.getByTestId('send-button').click();

  // 9. Verify message sent
  await expect(page.getByText('Hello from E2E test!')).toBeVisible();
  await expect(page.getByTestId('message-status-sent')).toBeVisible();
});
```

#### Scenario 2: Create Group & Send Media

```typescript
// Mobile (Detox)
describe('Create Group & Send Media', () => {
  beforeAll(async () => {
    // Assume already logged in
    await device.launchApp({ newInstance: false });
  });

  it('should create group and send image', async () => {
    // 1. New group
    await element(by.id('new-message-fab')).tap();
    await element(by.text('New Group')).tap();

    // 2. Select members
    await element(by.id('contact-0x123')).tap();
    await element(by.id('contact-0x456')).tap();
    await element(by.id('next-button')).tap();

    // 3. Group details
    await element(by.id('group-name-input')).typeText('Test Group');
    await element(by.id('create-button')).tap();

    // 4. Verify group created
    await expect(element(by.text('Test Group'))).toBeVisible();

    // 5. Send image
    await element(by.id('attachment-button')).tap();
    await element(by.text('Gallery')).tap();
    await element(by.id('photo-0')).tap(); // Select first photo
    await element(by.id('caption-input')).typeText('Check this out!');
    await element(by.id('send-button')).tap();

    // 6. Verify image sent
    await waitFor(element(by.id('message-image')))
      .toBeVisible()
      .withTimeout(10000); // Upload may take time
    await expect(element(by.text('Check this out!'))).toBeVisible();
  });
});
```

#### Scenario 3: Message Reactions & Replies

```typescript
// Web (Playwright)
test('react to message and send reply', async ({ page }) => {
  // Assume already in conversation
  await page.goto('/chat/test-channel-123');

  // 1. React to message
  const message = page.getByTestId('message-msg-123');
  await message.hover();
  await message.getByTestId('react-button').click();

  // 2. Select emoji
  await page.getByTestId('emoji-👍').click();

  // 3. Verify reaction added
  await expect(message.getByText('👍 1')).toBeVisible();

  // 4. Reply to message
  await message.hover();
  await message.getByTestId('reply-button').click();

  // 5. Verify reply bar
  await expect(page.getByText('Replying to')).toBeVisible();

  // 6. Send reply
  await page.getByPlaceholder('Type a message...').fill('Great point!');
  await page.getByTestId('send-button').click();

  // 7. Verify reply sent with reference
  const reply = page.getByText('Great point!');
  await expect(reply).toBeVisible();
  await expect(reply.locator('..').getByTestId('reply-reference')).toBeVisible();
});
```

#### Scenario 4: Offline & Sync

```typescript
// Mobile (Detox)
describe('Offline & Sync', () => {
  it('should queue messages offline and sync when online', async () => {
    // 1. Navigate to conversation
    await element(by.id('conversation-test-channel')).tap();

    // 2. Go offline
    await device.disableSynchronization(); // Disable network
    await expect(element(by.text('Offline'))).toBeVisible();

    // 3. Send message while offline
    await element(by.id('message-composer')).typeText('Offline message');
    await element(by.id('send-button')).tap();

    // 4. Verify message queued
    await expect(element(by.text('Offline message'))).toBeVisible();
    await expect(element(by.id('message-status-queued'))).toBeVisible();

    // 5. Go online
    await device.enableSynchronization();

    // 6. Verify message sent
    await waitFor(element(by.id('message-status-sent')))
      .toBeVisible()
      .withTimeout(5000);

    // 7. Verify sync completed
    await expect(element(by.text('Synced'))).toBeVisible();
  });
});
```

#### Scenario 5: Search & Navigation

```typescript
// Web (Playwright)
test('search messages and navigate', async ({ page }) => {
  // 1. Open search
  await page.goto('/chats');
  await page.getByTestId('search-button').click();

  // 2. Search for keyword
  await page.getByPlaceholder('Search messages...').fill('important');

  // 3. Verify results
  await expect(page.getByTestId('search-results')).toBeVisible();
  const results = page.getByTestId('search-result');
  await expect(results).toHaveCount(3);

  // 4. Click result
  await results.first().click();

  // 5. Verify navigation to message
  await expect(page).toHaveURL(/\/chat\/.*\?highlight=.*/);
  await expect(page.getByTestId('highlighted-message')).toBeVisible();

  // 6. Verify message highlighted
  await expect(page.getByTestId('highlighted-message')).toHaveClass(/highlight/);
});
```

### 9.4 Test Data Management

#### Mock Backend
```typescript
// e2e/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

#### Test Fixtures
```typescript
// e2e/fixtures/messages.ts
export const testMessages = [
  {
    id: 'msg-1',
    channelId: 'channel-1',
    author: '0x123',
    content: 'Hello world',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'msg-2',
    channelId: 'channel-1',
    author: '0x456',
    content: 'Hi there!',
    createdAt: '2024-01-01T00:01:00Z',
  },
];

export const testChannels = [
  {
    id: 'channel-1',
    kind: 'dm',
    members: ['0x123', '0x456'],
    latestMessage: testMessages[1],
  },
];
```

### 9.5 Test Execution

#### Local Development
```bash
# Mobile
pnpm test:e2e:ios
pnpm test:e2e:android

# Web
pnpm test:e2e:web
```

#### CI/CD
```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-mobile:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - run: pnpm install
      - run: pnpm build:mobile
      - run: pnpm test:e2e:ios

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: ios-e2e-artifacts
          path: apps/mobile/e2e/artifacts/

  e2e-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - run: pnpm install
      - run: pnpm build:web
      - run: pnpm test:e2e:web

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: web-e2e-artifacts
          path: apps/web/test-results/
```

### 9.6 Visual Regression Testing (Optional)

```typescript
// apps/web/e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test('conversation list visual regression', async ({ page }) => {
  await page.goto('/chats');

  // Wait for content to load
  await page.waitForSelector('[data-testid="conversation-list"]');

  // Take screenshot
  await expect(page).toHaveScreenshot('conversation-list.png', {
    fullPage: true,
    threshold: 0.2, // Allow 20% difference
  });
});

test('message thread visual regression', async ({ page }) => {
  await page.goto('/chat/test-channel-123');
  await page.waitForSelector('[data-testid="message-list"]');

  await expect(page).toHaveScreenshot('message-thread.png', {
    fullPage: true,
    threshold: 0.2,
  });
});
```

---

## 10. Implementation Phases

### Phase 0: Foundation (Week 1-2)

**Goals:**
- Set up monorepo
- Configure tooling
- Establish development workflow

**Tasks:**
1. Create Turborepo with pnpm workspaces
2. Set up TypeScript (strict mode)
3. Configure ESLint, Prettier, Husky
4. Set up Expo app (apps/mobile)
5. Set up Next.js app (apps/web)
6. Install Tamagui and configure theme
7. Set up GitHub Actions (CI)
8. Create initial package structure

**Testing:**
- Verify builds work (iOS, Android, Web)
- Run linters and type checks
- Test CI pipeline

**DoD:**
- One command builds all platforms
- CI runs on every PR
- "Hello World" renders on all platforms

---

### Phase 1: Authentication (Week 2-3)

**Goals:**
- Wallet connection
- zkLogin integration
- Session key management

**Tasks:**
1. Install @mysten/dapp-kit
2. Create WalletProvider
3. Implement wallet connection UI
4. Add zkLogin flow
5. Create SessionKeyProvider
6. Implement session key creation/refresh
7. Add session persistence

**Testing:**
- Unit tests for session key logic
- Component tests for wallet UI
- Integration test for full auth flow
- Test session expiry and refresh

**DoD:**
- Users can connect wallet or zkLogin
- Session keys work without repeated prompts
- Session persists across app restarts

---

### Phase 2: Messaging SDK Integration (Week 3-4)

**Goals:**
- Integrate Sui Messaging SDK
- Set up Seal encryption
- Create messaging providers

**Tasks:**
1. Install sui-stack-messaging-sdk and Seal
2. Create MessagingProvider
3. Implement encryption service
4. Create useMessaging hook
5. Set up GraphQL client for indexer
6. Implement basic channel queries

**Testing:**
- Unit tests for encryption service
- Integration tests for SDK methods
- Mock GraphQL responses

**DoD:**
- SDK initialized and connected
- Can query channels from indexer
- Encryption/decryption works

---

### Phase 3: Core UI Components (Week 4-5)

**Goals:**
- Build reusable UI components
- Implement design system

**Tasks:**
1. Create ChatBubble component
2. Create MessageList component (virtualized)
3. Create MessageComposer component
4. Create ConversationList component
5. Create Avatar component
6. Create common UI primitives (Button, Input, etc.)
7. Implement light/dark themes

**Testing:**
- Component tests for each component
- Visual regression tests (screenshots)
- Accessibility tests

**DoD:**
- All core components built
- Components work on mobile and web
- Theming system functional

---

### Phase 4: Channel Management (Week 5-6)

**Goals:**
- Create/list channels
- Join/leave channels
- Manage members

**Tasks:**
1. Implement createChannel mutation
2. Implement useChannels query
3. Create ConversationList screen
4. Create NewMessage screen
5. Create NewGroup flow
6. Implement member management

**Testing:**
- Integration tests for channel creation
- E2E test for group creation flow
- Test member permissions

**DoD:**
- Users can create DMs and groups
- Can view channel list
- Can manage members (admins)

---

### Phase 5: Messaging Core (Week 6-8)

**Goals:**
- Send/receive messages
- Message actions (edit, delete, reply)
- Read receipts

**Tasks:**
1. Implement sendMessage mutation
2. Implement useMessages query
3. Create ConversationThread screen
4. Implement message actions (context menu)
5. Add reply/forward functionality
6. Implement edit/delete
7. Add read receipts
8. Add reactions

**Testing:**
- Unit tests for message hooks
- Integration tests for send flow
- E2E tests for message actions
- Test optimistic updates

**DoD:**
- Full messaging functionality works
- Can send, receive, edit, delete messages
- Replies and reactions work
- Read receipts visible

---

### Phase 6: Attachments & Media (Week 8-9)

**Goals:**
- Send/receive images, videos, files
- Integrate Walrus storage

**Tasks:**
1. Install Walrus SDK
2. Create WalrusProvider
3. Implement file encryption
4. Implement upload flow
5. Implement download/decryption
6. Create media viewers
7. Add thumbnail generation
8. Implement progress indicators

**Testing:**
- Unit tests for upload/download
- Integration tests for full attachment flow
- Test large files
- Test different file types

**DoD:**
- Can send images, videos, files
- Attachments encrypted before upload
- Media displays correctly
- Progress shown during upload

---

### Phase 7: Sync & Real-time (Week 9-10)

**Goals:**
- Cursor-based sync
- Polling for updates
- Local caching

**Tasks:**
1. Implement cursor-based pagination
2. Create sync service
3. Implement polling mechanism
4. Set up SQLite cache (mobile)
5. Set up IndexedDB cache (web)
6. Implement cache hydration
7. Handle offline queue

**Testing:**
- Integration tests for sync
- Test cursor pagination
- Test cache persistence
- E2E test for offline/online

**DoD:**
- Messages sync automatically
- Polling works reliably
- Offline messages queue
- Cache persists across sessions

---

### Phase 8: Notifications (Week 10-11)

**Goals:**
- Push notifications
- In-app notifications
- Notification permissions

**Tasks:**
1. Set up Expo Notifications
2. Set up Web Push
3. Create push relay service
4. Implement notification handlers
5. Add notification permissions flow
6. Implement mute/unmute
7. Add notification settings

**Testing:**
- Test notifications in different app states
- Test notification tap-through
- Test muted conversations
- E2E test for notification flow

**DoD:**
- Push notifications work on mobile and web
- Tapping notification opens correct chat
- Can mute conversations
- Notification settings work

---

### Phase 9: Advanced Features (Week 11-12)

**Goals:**
- Search
- Pinned messages
- Broadcast channels

**Tasks:**
1. Implement local search (SQLite FTS)
2. Create search UI
3. Implement pinned messages
4. Add channel roles (admin, member, reader)
5. Implement broadcast channels
6. Add channel settings screen

**Testing:**
- Test search accuracy
- Test search performance
- Test role permissions
- E2E test for channels

**DoD:**
- Search works across all messages
- Can pin/unpin messages
- Broadcast channels functional
- Role-based permissions enforced

---

### Phase 10: Gas & Sponsorship (Week 12-13)

**Goals:**
- Sponsored transactions
- Gas optimization

**Tasks:**
1. Implement transaction sponsorship
2. Add sponsorship backend/service
3. Implement gas estimation
4. Add sponsored tx UI indicators
5. Implement throttling/abuse prevention
6. Add gas settings screen

**Testing:**
- Test sponsored transactions
- Test gas estimation accuracy
- Test throttling logic
- E2E test for sponsored flow

**DoD:**
- Users can send without SUI balance
- Sponsorship throttling works
- Gas settings accessible

---

### Phase 11: Polish & Optimization (Week 13-14)

**Goals:**
- Performance optimization
- UX improvements
- Bug fixes

**Tasks:**
1. Optimize message list rendering
2. Implement image optimization
3. Add loading skeletons
4. Improve error handling
5. Add empty states
6. Improve accessibility
7. Fix reported bugs

**Testing:**
- Performance testing (profiling)
- Test on low-end devices
- Accessibility audit
- Regression testing

**DoD:**
- App performs smoothly
- All critical bugs fixed
- Accessibility score >90%

---

### Phase 12: Security & Review (Week 14-15)

**Goals:**
- Security hardening
- Third-party review
- Penetration testing

**Tasks:**
1. Security code review
2. Implement Seal best practices
3. Add rate limiting
4. Implement abuse prevention
5. Third-party security audit
6. Address audit findings
7. Penetration testing

**Testing:**
- Security testing
- Threat modeling
- Review key management
- Test encryption end-to-end

**DoD:**
- Security audit passed
- All critical findings addressed
- Encryption validated

---

### Phase 13: Testing & QA (Week 15-16)

**Goals:**
- Comprehensive testing
- Bug fixes
- Release preparation

**Tasks:**
1. Complete unit test coverage
2. Complete component test coverage
3. Complete E2E test suite
4. Manual testing on devices
5. Beta testing program
6. Bug triage and fixes
7. Performance testing

**Testing:**
- All test suites passing
- Coverage >80%
- No critical bugs
- Performance benchmarks met

**DoD:**
- All tests passing
- Beta feedback addressed
- Ready for release

---

## Appendix A: Quick Reference

### Key Technologies
- **Frontend:** Expo (React Native), Next.js, TypeScript
- **UI:** Tamagui
- **State:** Zustand, React Query
- **Blockchain:** Sui, Seal, Walrus
- **Testing:** Jest, Detox, Playwright
- **Build:** Turborepo, pnpm, EAS

### Critical Paths to Test
1. Onboarding → Connect wallet → Send first message
2. Create group → Invite members → Send media
3. Receive message → React → Reply
4. Go offline → Queue message → Sync when online
5. Search messages → Navigate to result

### Performance Targets
- **Time to Interactive:** <3s on mobile, <2s on web
- **Message Render:** <16ms per message (60fps)
- **Search:** <500ms for 10k messages
- **Upload:** Show progress, allow cancellation
- **Sync:** <5s for 100 new messages

### Security Checklist
- ✅ All messages encrypted with Seal
- ✅ Attachments encrypted before Walrus upload
- ✅ No plaintext in logs
- ✅ Session keys short-lived (<7 days)
- ✅ Wallet signatures for sensitive operations
- ✅ Rate limiting on sponsored transactions
- ✅ Client-side search only

---

**End of CLAUDE.md**
