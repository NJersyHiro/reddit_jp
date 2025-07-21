# Itaita UI/UX Design Specifications

## Design Philosophy

- **Japanese-First**: Optimized for Japanese reading patterns and cultural expectations
- **Mobile-First**: Designed primarily for mobile devices with responsive desktop layouts
- **Minimalist**: Clean, focused interface reducing cognitive load
- **Accessible**: WCAG 2.1 AA compliant with high contrast and readable typography

## Brand Guidelines

### Colors

```css
/* Primary Colors */
--primary-red: #DC2626;        /* Main brand color - inspired by Japanese flag */
--primary-dark: #991B1B;       /* Darker variant for hover states */
--primary-light: #FEE2E2;      /* Light variant for backgrounds */

/* Neutral Colors */
--gray-900: #111827;           /* Primary text */
--gray-700: #374151;           /* Secondary text */
--gray-500: #6B7280;           /* Muted text */
--gray-300: #D1D5DB;           /* Borders */
--gray-100: #F3F4F6;           /* Backgrounds */
--white: #FFFFFF;              /* Base background */

/* Semantic Colors */
--success: #10B981;            /* Upvotes, success messages */
--error: #EF4444;              /* Downvotes, errors */
--warning: #F59E0B;            /* Warnings */
--info: #3B82F6;               /* Information */

/* Dark Mode */
--dark-bg: #0F172A;            /* Dark background */
--dark-surface: #1E293B;       /* Card backgrounds */
--dark-border: #334155;        /* Borders in dark mode */
```

### Typography

```css
/* Font Stack */
--font-sans: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", 
             "Meiryo", sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## Core User Flows

### 1. Homepage (Guest User)

```
┌─────────────────────────────────────────┐
│  🔴 Itaita         [Sign In] [Sign Up]  │ <- Header
├─────────────────────────────────────────┤
│                                         │
│  [Gaming] [Career] [Parenting] [Life]   │ <- Category Tabs
│  [Investing] [+ More]                   │
│                                         │
├─────────────────────────────────────────┤
│  Sort: [🔥 Hot ▼] [New] [Top]          │ <- Sort Options
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ▲ 245  Tips for new RPG boss        │ │ <- Thread Card
│ │ ▼      Posted by RPGHunter88 • 2h   │ │
│ │        💬 43 comments                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ▲ 189  Best side hustles in 2024    │ │
│ │ ▼      Posted anonymously • 5h      │ │
│ │        💬 67 comments                │ │
│ └─────────────────────────────────────┘ │
│                                         │
│         [Load More Threads]             │
└─────────────────────────────────────────┘
```

### 2. Thread View

```
┌─────────────────────────────────────────┐
│  ← Back to Gaming                       │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ▲     Tips for new RPG boss         │ │
│ │ 245   ─────────────────────────────  │ │
│ │ ▼     Posted by RPGHunter88 • 2h    │ │
│ │                                      │ │
│ │ I found a strategy that works       │ │
│ │ really well against the fire boss   │ │
│ │ in chapter 5...                      │ │
│ │                                      │ │
│ │ [Read More]                          │ │
│ │                                      │ │
│ │ 💬 43  🔗 Share  ⚐ Report  ⭐ Save  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  Sort Comments: [Best ▼] [New] [Old]   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ▲ 45  Great tips! Here's what      │ │ <- Top Level Comment
│ │ ▼     worked for me...              │ │
│ │       by commenter1 • 1h            │ │
│ │                                      │ │
│ │   └─ ▲ 12  Thanks, this helped!    │ │ <- Nested Reply
│ │      ▼     by gamer456 • 30m       │ │
│ │                                      │ │
│ │   └─ ▲ 8   Also try using ice      │ │
│ │      ▼     spells... by anon • 15m │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [💬 Add a comment...]                   │ <- Comment Box
└─────────────────────────────────────────┘
```

### 3. Create Thread

```
┌─────────────────────────────────────────┐
│  ← Cancel         Create Thread         │
├─────────────────────────────────────────┤
│                                         │
│  Category*                              │
│  [Gaming ▼]                            │
│                                         │
│  Title* (max 300 characters)           │
│  ┌─────────────────────────────────┐   │
│  │ Tips for beating the fire boss  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Content                                │
│  ┌─────────────────────────────────┐   │
│  │ I discovered that if you use    │   │
│  │ ice magic combined with...      │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  [B] [I] [Link] [Image]                │
│                                         │
│  Tags (comma separated)                 │
│  ┌─────────────────────────────────┐   │
│  │ tips, rpg, boss-fight           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  □ Post anonymously                     │
│  Anonymous name (optional)              │
│  ┌─────────────────────────────────┐   │
│  │ RPGExpert2024                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│         [Post Thread]                   │
└─────────────────────────────────────────┘
```

### 4. Mobile Navigation

```
┌─────────────────────────┐
│  🔴 Itaita      🔍 ☰   │ <- Compact Header
├─────────────────────────┤
│ [Gaming] [Career] [+]   │ <- Scrollable Categories
├─────────────────────────┤
│  Thread content...      │
│                         │
├─────────────────────────┤ <- Bottom Navigation
│  🏠    📝    🔔    👤   │
│ Home  Post  Alerts  Me  │
└─────────────────────────┘
```

## Component Library

### 1. Thread Card Component

```jsx
<ThreadCard>
  <VoteButtons>
    <UpvoteButton active={userVoted === 1} />
    <Score>{thread.score}</Score>
    <DownvoteButton active={userVoted === -1} />
  </VoteButtons>
  
  <Content>
    <Title>{thread.title}</Title>
    <Meta>
      <Author anonymous={thread.is_anonymous}>
        {thread.anonymous_name || thread.user.username}
      </Author>
      <Time>{formatTime(thread.created_at)}</Time>
    </Meta>
    <Stats>
      <CommentCount>{thread.comment_count}</CommentCount>
    </Stats>
  </Content>
</ThreadCard>
```

### 2. Comment Component

```jsx
<Comment depth={depth}>
  <CommentHeader>
    <VoteButtons compact />
    <Author>{comment.author}</Author>
    <Time>{timeAgo}</Time>
  </CommentHeader>
  
  <CommentBody>
    {comment.content}
  </CommentBody>
  
  <CommentActions>
    <ReplyButton />
    <ShareButton />
    <ReportButton />
  </CommentActions>
  
  {replies && <CommentReplies />}
</Comment>
```

### 3. Navigation Components

```jsx
<!-- Desktop Navigation -->
<DesktopNav>
  <Logo />
  <CategoryNav>
    <CategoryTab active>Gaming</CategoryTab>
    <CategoryTab>Career</CategoryTab>
    <CategoryTab>Parenting</CategoryTab>
    <Dropdown>More Categories</Dropdown>
  </CategoryNav>
  <UserNav>
    <SearchButton />
    <NotificationBell count={3} />
    <UserMenu />
  </UserNav>
</DesktopNav>

<!-- Mobile Bottom Nav -->
<MobileBottomNav>
  <NavItem icon="home" active>Home</NavItem>
  <NavItem icon="create">Post</NavItem>
  <NavItem icon="bell" badge={3}>Alerts</NavItem>
  <NavItem icon="user">Me</NavItem>
</MobileBottomNav>
```

## Interaction Patterns

### Voting
- Single tap to vote (optimistic UI update)
- Tap again to remove vote
- Long press shows vote count breakdown
- Visual feedback: color change + subtle animation

### Threading
- Tap comment to collapse/expand replies
- Swipe left on comment for quick actions (mobile)
- Indentation increases by 16px per level
- Max visual depth: 5 levels (continue threading allowed)

### Loading States
- Skeleton screens for initial loads
- Inline spinners for actions
- Pull-to-refresh on mobile
- Infinite scroll with loading indicator

### Error States
- Inline error messages
- Retry buttons for failed requests
- Offline mode indicators
- Form validation messages in Japanese

## Responsive Breakpoints

```css
/* Mobile First Approach */
--mobile: 0px;        /* Default */
--tablet: 768px;      /* iPad */
--desktop: 1024px;    /* Desktop */
--wide: 1280px;       /* Wide screens */
```

## Accessibility Features

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - J/K for next/previous thread
   - Enter to expand/collapse
   - Escape to close modals

2. **Screen Reader Support**
   - Semantic HTML structure
   - ARIA labels for icons
   - Live regions for updates
   - Skip navigation links

3. **Visual Accessibility**
   - High contrast mode support
   - Focus indicators (2px outline)
   - Minimum touch target: 44x44px
   - Color not sole indicator

## Animation Guidelines

```css
/* Micro-interactions */
--transition-fast: 150ms ease-out;
--transition-normal: 250ms ease-out;
--transition-slow: 350ms ease-out;

/* Hover states */
button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Vote animation */
@keyframes vote-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

## Mobile-Specific Features

1. **Gesture Support**
   - Pull to refresh
   - Swipe between categories
   - Long press for context menu
   - Pinch to zoom images

2. **PWA Features**
   - App icon and splash screen
   - Offline thread reading
   - Background sync for votes
   - Push notifications

3. **Performance**
   - Lazy load images
   - Virtual scrolling for long threads
   - Preload next page
   - Compress images on upload

## Dark Mode

All components support dark mode with:
- Automatic detection based on system preference
- Manual toggle in user settings
- Smooth transition between modes
- Adjusted colors for readability

## Implementation Notes

1. Use Tailwind CSS for utility-first styling
2. Component library: Radix UI for unstyled components
3. Icons: Heroicons or custom SVG set
4. Form library: React Hook Form with Zod validation
5. Animation: Framer Motion for complex animations
6. State: Zustand for global UI state