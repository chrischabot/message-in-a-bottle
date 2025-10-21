# PLAN.md — Telegram‑Style Messenger on Sui (TypeScript • Mobile + Web)

App Name: Message in a Bottle

**Goal:** Build a Telegram‑style messaging app (look & feel + core flows) with a single **TypeScript** codebase that ships to **iOS, Android, and Web**. The app is **entirely powered by Sui** and the **Sui Stack Messaging SDK** (plus **Seal** for E2EE and **Walrus** for attachments).

> **Note:** Verify the current stability/network support of the Sui Stack Messaging SDK before Mainnet launch. Treat the first public release as a Testnet MVP and gate Mainnet behind SDK GA + security review.

**Primary repo to integrate:**  
Sui Stack Messaging SDK — <https://github.com/MystenLabs/sui-stack-messaging-sdk>

---

## 0) Platform decision (with alternatives)

**Recommended:** **Expo (React Native) + React Native Web**, single TS codebase (iOS, Android, Web/PWA).  
*Why:* First‑class TypeScript, wide ecosystem, straightforward mobile builds via EAS, and clean web target.

**Alternatives (if team is web‑first):**
- **Ionic React + Capacitor** — fastest path from web to app stores; good plugin ecosystem.
- **NativeScript (TS)** — direct native APIs from JS/TS; smaller web‑parity story.

> **Decision rule:** Choose Expo unless you have strong web‑first constraints that favor Ionic/Capacitor.

---

## 1) High‑level architecture

**On‑chain & crypto**
- **Sui**: channels, messages, membership caps on‑chain; history via RPC/GraphQL indexers.
- **Seal (E2EE)**: client‑side encryption; **Session Keys** for fetching decryption material without constant wallet prompts.
- **Walrus (attachments)**: decentralized blob store — only upload **encrypted** payloads; store references on Sui.

**Wallets & auth**
- **Sui dApp Kit** + **Wallet Standard** for wallet interop.
- **zkLogin** as optional friction‑reduced onboarding for web2 users.

**Realtime & data access**
- **Primary**: Sui GraphQL RPC/Indexer for history + incremental sync (cursor‑based pagination).
- **Live updates**: Short‑interval polling or your own small worker that tails the chain and fans out web/mobile push.

**Monorepo layout**
```
apps/
  mobile/    # Expo app (iOS/Android)
  web/       # Next.js (or Expo web) app
packages/
  ui/        # Tamagui design system + Telegram-like components
  messaging/ # Wrapper around Sui Messaging SDK + Seal + Walrus helpers
  shared/    # Types (zod), utils, config, feature flags
  indexer/   # GraphQL queries, fragments, pagination helpers
```

---

## 2) Product & legal guardrails

- Mimic **patterns and interactions**, not Telegram brand assets or trade dress. Use your own icons (e.g., Lucide), colors, and typography.
- MVP scope: **1:1 chats, groups, channels, rich media, replies/forwards, edit/delete, pinned, reactions, global search (local), read receipts, notifications.**

---

## 3) Phase‑by‑phase plan (with deliverables & DoD)

### Phase A — Repo, tooling, foundations
**Steps**
1. Create a Turborepo monorepo and universal RN+web skeleton (Expo for native; Next.js or Expo Web for web).
2. Enable TypeScript **strict**; ESLint + Prettier; Husky + lint‑staged.
3. Add **Tamagui** (or similar) for a shared **design system** and cross‑platform primitives.
4. Set up CI (GitHub Actions): typecheck, tests, EAS builds, static web build.
5. Configure PWA (web), app icons, splash.

**DoD**
- One command builds iOS/Android/Web; a single “Hello chat” screen renders on all targets.

---

### Phase B — Sui connectivity & identity
**Steps**
1. Add **Sui dApp Kit** and **Wallet Standard** to connect wallets on web and native (via in‑app browser or deep links).
2. Add **zkLogin** as an alternative sign‑in; store mapping to wallet address if users later upgrade.
3. Implement account selector UI, connection state, and session persistence.

**DoD**
- User can connect a Sui account (wallet or zkLogin) on mobile & web; address visible; basic RPC calls succeed.

---

### Phase C — Messaging SDK client & Session Keys
**Steps**
1. Install **sui-stack-messaging-sdk** and **Seal**.
2. Implement a `SessionKeyProvider` (request signature from the wallet → mint short‑lived session key; refresh on expiry).
3. Implement `MessagingClientProvider` that composes Seal client + Messaging client.
4. Expose `useMessaging()` with strongly typed helpers (channels, messages, send/receive).

**DoD**
- After connecting, user sees SDK status (session live/expired) and can initialize/refresh the messaging client.

---

### Phase D — Channels (DMs, groups) & membership
**Steps**
1. Model **Channels** as the SDK’s core container with creator & member caps.
2. Implement `createChannelFlow` to create channels and distribute `CreatorCap` / `MemberCap` objects.
3. List user channels (`getChannelObjectsByAddress`) and fetch details (`getChannelObjectsByChannelIds`).
4. Invite flows: mint/add `MemberCap` for invitees; render pending vs active members.

**DoD**
- User can create DMs and groups, see membership, and open a channel thread.

---

### Phase E — Messaging UX (core interactions)
**Steps**
1. **Send/receive** messages (`sendMessage`, `getChannelMessages`); render replies and forwards (metadata fields).
2. **Message actions:** copy, delete (on‑chain delete or tombstone), edit (revision pointer).
3. **Read receipts:** if not native in SDK, implement as a lightweight message type (`read_at`) summarized per user.
4. **Reactions:** small reaction events keyed by message digest.
5. **Pinned messages:** channel‑level field pointing to selected message digest(s).
6. **Search:** decrypt locally and index on device (SQLite via `expo-sqlite`; web fallback to IndexedDB).

**DoD**
- Telegram‑like thread view with bubbles, replies, reactions, edit/delete, pinned banner, and read ticks.

---

### Phase F — Attachments & media
**Steps**
1. **Encrypt** attachments with Seal **client‑side**; upload ciphertext to **Walrus**; store the Walrus reference + metadata on the message.
2. Implement thumbnails, preview, progressive loading; handle unsupported formats gracefully.

**DoD**
- Images/videos/files send, display, and reload across devices after decryption.

---

### Phase G — Realtime & sync
**Steps**
1. Use **GraphQL RPC/Indexer** for pagination by channel with a durable **cursor**.
2. Poll at a short interval for new items; reconcile with local cache using message digest & sequence.
3. (Optional) A tiny worker tails GraphQL/transactions and emits push/socket notifications to clients.

**DoD**
- Messages appear near‑realtime without manual refresh; app resumes with a cursor and incremental sync.

---

### Phase H — Broadcast Channels & admin UX
**Steps**
1. Support roles: owner, admins, read‑only members; UI to promote/demote; post permissions enforced on‑chain.
2. Policy extensions (e.g., **Slow mode**, **Join approvals**) as programmable flows in Move; surface toggles in channel settings.

**DoD**
- “Channel” type where only admins can post; subscribers read/react.

---

### Phase I — Identity, usernames & discovery
**Steps**
1. **Wallet‑native identity** by default (address + app handle). Integrate Sui name systems if available, or keep an app‑local registry on Sui.
2. **Contact book**: optional device contact import (hash ⇒ on‑chain registry lookup). Avoid storing PII on‑chain; use salted hashes off‑chain if needed.
3. **zkLogin**: map OAuth identities to Sui addresses without publicly linking; make this **optional**.

**DoD**
- Users can claim a handle, search by handle/address, and start chats without phone numbers.

---

### Phase J — Notifications
**Steps**
1. Use **Expo Notifications** for mobile (APNs/FCM) and **Web Push** for web.
2. A small relay service watches for new on‑chain messages and triggers push notifications; the push payload must be non‑sensitive (“You have a new message”).

**DoD**
- Foreground, background, and quit‑state push notifications open the correct chat on tap.

---

### Phase K — Gas & UX polish
**Steps**
1. Implement **Sponsored Transactions** so users can send messages without SUI in their wallet; throttle sponsorship per user/channel; show “sponsored by <app>” in details.
2. If sponsorship is off, guide users to acquire small SUI; display per‑message gas in settings.

**DoD**
- Messaging flow works whether or not the user holds SUI; transactions still sign in‑wallet.

---

### Phase L — Performance & offline
**Steps**
1. Cache decrypted message bodies locally; use aggressive pagination & windowing.
2. Persist to `expo-sqlite` (or MMKV for small key‑value state); for web, use IndexedDB.
3. Background refresh hooks to pre‑fetch last N messages per open channel.

**DoD**
- Large chats scroll smoothly; cold start shows recent history instantly.

---

### Phase M — Security hardening
**Steps**
1. **Seal best practices**: short‑lived **Session Keys**; rotation; pin to vetted key servers (t‑of‑n availability).
2. No plaintext in logs or analytics; scrub crash logs.
3. Spam mitigation: rate limits, channel join policies, report/block lists on‑chain; client‑side mute/ban UX.
4. Third‑party security review of cryptographic flows; threat modeling; secure backups for device keys.

**DoD**
- Independent review passes; red‑team checklist complete.

---

### Phase N — Theming & “Telegram‑style” UX
**Steps**
1. Build a **design system** (Tamagui/variants) with themes: Light/Dark, high contrast, accent color tokens.
2. Screens to mirror Telegram’s IA (without copying assets):
   - **Chats** (search, filters), **Chat** (composer, attachments, reply/forward, long‑press actions)
   - **New Message**, **New Group**, **New Channel**
   - **Profile**, **Settings** (Notifications, Privacy, Data & Storage, Devices)

**DoD**
- Heuristic review confirms parity of flows and discoverability with Telegram‑like mental models.

---

### Phase O — QA, CI/CD, store readiness
**Steps**
1. Unit tests (hooks, reducers), integration tests (mock RPC/SDK), end‑to‑end (Detox for native, Playwright for web).
2. APNs/FCM entitlements; privacy labels (encryption); data‑use disclosures.
3. EAS build pipelines (iOS/Android) and web deploy; smoke tests on physical devices.

**DoD**
- Test matrix green across iOS/Android/Web; store builds pass review.

---

## 4) Concrete implementation notes

- **SDK primitives**
  - Session key setup: wallet signature → **SessionKey** → fetch decryption keys during session.
  - Messaging client provider: compose **Seal** + **Messaging SDK** once; expose hooks.
  - Channel flows: `createChannelFlow`, `getChannelObjectsByAddress`, `getChannelMessages`, `sendMessage`.
- **Attachments**
  - Always **encrypt** with Seal before **Walrus** upload; store only references on‑chain.
- **Realtime**
  - Prefer GraphQL Indexer + polling; optional worker to push notifications.
- **Notifications**
  - Expo Notifications for mobile, Web Push for web; push payloads should never contain plaintext content.

---

## 5) Suggested package structure (monorepo)

```
/apps
  /mobile        # Expo app (iOS/Android)
  /web           # Next.js app (or Expo web)
/packages
  /ui            # Design system + reusable components
  /messaging     # SDK wrapper & providers (Sui Messaging + Seal + Walrus)
  /shared        # zod types, utils, feature flags, config
  /indexer       # GraphQL queries, fragments, and pagination
```

---

## 6) UI component checklist (Telegram‑style)

- **Chat List:** avatars, last message preview, unread badge, pin/mute, swipe actions.
- **Chat View:** bubbles (incoming/outgoing), quoted replies, link previews, media grid, code blocks, date dividers, double‑tick receipts.
- **Composer:** text, emoji (system or Noto Emoji), attachments, camera, voice notes (stretch).
- **Thread Actions:** long‑press menu (reply, forward, edit, delete, copy, multi‑select).
- **Group/Channel:** member list, roles, invite links, slow mode (policy), post as channel.
- **Settings:** profile, username/handle, privacy (last seen, read receipts), data usage, devices, notifications.

---

## 7) Minimal data model (map to SDK objects)

- **Channel**  
  `{ id, kind: 'dm' | 'group' | 'channel', policy, latestMessage, pinned[], createdAt }`
- **Membership**  
  `{ channelId, account, role, joinedAt }`
- **Message**  
  `{ id, channelId, author, type: 'text' | 'media' | 'system' | 'reaction' | 'read',
     contentCiphertextRef, sealPolicyRef, walrusBlobId?, replyTo?, editedAt?, createdAt }`
- **Reaction**  
  `{ messageId, actor, emoji, createdAt }`
- **ReadReceipt**  
  `{ messageId, reader, readAt }`

> Store ciphertext/attachments **off‑chain** (Walrus) and references + metadata **on‑chain**. Decrypt only on client.

---

## 8) Gas & cost strategy

- Default to **Sponsored Transactions** for message sends; throttle sponsorship per user/channel; add abuse protection.
- If sponsorship disabled, guide users to acquire a small SUI balance; expose per‑message gas in settings.

---

## 9) Security & privacy

- End‑to‑end encryption via **Seal** for messages & attachments; no plaintext in logs.
- Client‑side search only over decrypted content; do **not** ship decrypted content to any server.
- Reporting & abuse: on‑chain report objects with client policy to hide content locally; preserve verifiability on‑chain.

---

## 10) Stretch goals

- **Typing indicators / presence**: ephemeral off‑chain channel (WebRTC/WebSocket); never carry content.
- **Voice/video calls**: WebRTC with on‑chain signaling objects; access gating via Seal policy.
- **Multi‑device key sync**: secure device key backup and recovery via Seal‑protected blobs.

---

## 11) Risks & mitigations

- **SDK maturity**: feature flags + environment toggles; plan migrations; ship Testnet MVP first.
- **Realtime variability**: prefer GraphQL + polling; treat provider WS subscriptions as optional.
- **App store compliance**: document E2EE; surface moderation/reporting; provide legal takedown process (client‑side hide).

---

## 12) “Day‑1” copy‑paste task list

1. **Scaffold monorepo** (Turborepo). Add `apps/mobile` (Expo) and `apps/web` (Next or Expo web). Enable TS strict, ESLint, Prettier, Husky.
2. **Design system**: Install Tamagui (or similar). Create tokens (colors, spacing, radii) and primitives (`ListItem`, `Bubble`, `Composer`, `Toolbar`).
3. **Wallets**: Install `@mysten/dapp-kit` and Wallet Standard. Render wallet connect modal; show connected address.
4. **Messaging client**: Install `sui-stack-messaging-sdk` + `Seal`. Build `SessionKeyProvider` and `MessagingClientProvider`. Expose `useMessaging()` with `createChannelFlow`, `getChannelMessages`, `sendMessage`.
5. **Channels & threads**: Build “New Chat / New Group / New Channel” flows; list channels; render thread with pagination (indexer + cursor).
6. **Attachments**: Implement Seal encrypt → Walrus upload; store Walrus ID on Sui; image/video/file viewers.
7. **Realtime**: Implement polling sync with cursor; optional small worker to send push notifications.
8. **Sponsored gas**: Implement sponsorship flow; feature‑flag it; add abuse protection.
9. **Notifications**: Configure Expo push + Web Push; wire relay service watching for new messages.
10. **Offline**: Add `expo-sqlite` cache for decrypted messages; warm caches at app start.
11. **QA & release**: Detox/Playwright smoke tests; EAS builds; deploy web.

---

## 13) Appendix — TypeScript skeletons

```ts
// packages/messaging/types.ts
export type ChannelKind = 'dm' | 'group' | 'channel';

export interface Channel {
  id: string;
  kind: ChannelKind;
  policy?: unknown;
  latestMessage?: Message;
  pinnedIds?: string[];
  createdAt: string;
}

export interface Membership {
  channelId: string;
  account: string;
  role: 'owner' | 'admin' | 'member' | 'reader';
  joinedAt: string;
}

export type MessageType = 'text' | 'media' | 'system' | 'reaction' | 'read';

export interface Message {
  id: string;
  channelId: string;
  author: string;
  type: MessageType;
  // References (ciphertext + policy + optional blob)
  contentCiphertextRef: string;
  sealPolicyRef: string;
  walrusBlobId?: string;
  replyTo?: string;
  editedAt?: string;
  createdAt: string;
}

export interface Reaction {
  messageId: string;
  actor: string;
  emoji: string;
  createdAt: string;
}

export interface ReadReceipt {
  messageId: string;
  reader: string;
  readAt: string;
}
```

```ts
// packages/messaging/provider.tsx
import React, { createContext, useContext, useMemo } from 'react';
// import { SealClient, createSessionKey } from '@mysten/seal-sdk';
// import { MessagingClient } from '@mysten/sui-stack-messaging-sdk';

type MessagingContextValue = {
  // e.g., client instances, session status, helpers
  sendMessage: (channelId: string, plaintext: string, meta?: Record<string, unknown>) => Promise<void>;
  getMessages: (channelId: string, cursor?: string) => Promise<{ items: any[]; nextCursor?: string }>;
  createChannel: (params: { kind: 'dm' | 'group' | 'channel'; members: string[] }) => Promise<string>;
};

const MessagingContext = createContext<MessagingContextValue | null>(null);

export const MessagingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // const seal = useSealClient();
  // const session = useSessionKey();
  // const messaging = useMessagingClient({ seal, session });
  const value = useMemo<MessagingContextValue>(() => ({
    async sendMessage(channelId, plaintext, meta) {
      // 1) Encrypt with Seal
      // 2) Optionally upload to Walrus (attachments)
      // 3) Send via Messaging SDK
    },
    async getMessages(channelId, cursor) {
      // Query indexer (GraphQL) with cursor; decrypt on client
      return { items: [], nextCursor: undefined };
    },
    async createChannel({ kind, members }) {
      // Create channel, issue caps, return channelId
      return '0xCHANNEL';
    },
  }), []);

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
};

export const useMessaging = () => {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error('useMessaging must be used within MessagingProvider');
  return ctx;
};
```

```ts
// packages/ui/components/ChatBubble.tsx
import { View, Text } from 'react-native';
export const ChatBubble = ({ mine, children }: { mine?: boolean; children: React.ReactNode }) => {
  return (
    <View style={{
      alignSelf: mine ? 'flex-end' : 'flex-start',
      maxWidth: '80%',
      borderRadius: 16,
      padding: 10,
      marginVertical: 2,
      backgroundColor: mine ? '#DCF8C6' : '#FFFFFF',
    }}>
      <Text>{children}</Text>
    </View>
  );
};
```

---

## 14) Acceptance criteria for MVP

- ✅ Connect via wallet or zkLogin and initialize session keys without repeated prompts.
- ✅ Create DMs, groups, and broadcast channels; invite members; roles enforced.
- ✅ Send/receive text + media with E2EE; attachments encrypted and stored off‑chain (Walrus).
- ✅ Reactions, edit/delete, replies/forwards, pinned; client‑side search over decrypted cache.
- ✅ Near‑realtime updates (polling) with cursor‑based pagination & robust resume.
- ✅ Push notifications on mobile + web; tap‑through opens correct thread.
- ✅ Sponsored gas option; fallback UX if disabled.
- ✅ Smooth scrolling for large chats; offline‑friendly caches.
- ✅ Security review (Seal usage, key rotation, logs sanitized).

---

## 15) Next steps

- Convert “Day‑1 task list” into GitHub issues with labels (phase, platform, design system, SDK, security).
- Stand up a minimal indexer/relay service (if needed) for notifications and light presence.
- Prepare Testnet MVP launch notes and user onboarding (wallets, zkLogin, sponsorship).

---

**End of PLAN.md**
