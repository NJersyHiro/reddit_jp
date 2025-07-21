# Itaita Mobile-First Design Strategy

## Mobile Usage Context

Japanese mobile internet usage patterns:
- **Commute Time**: Primary usage during train commutes (average 1-2 hours daily)
- **One-Handed Usage**: Designed for thumb-reach on phones 5.5"-6.5"
- **Quick Interactions**: Optimized for 30-second to 5-minute sessions
- **Data Conscious**: Efficient data usage for mobile networks

## Mobile-First Principles

### 1. Touch-First Interface

```css
/* Minimum touch target sizes */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Thumb-friendly zones */
.bottom-actions {
  position: fixed;
  bottom: 0;
  /* Primary actions in easy thumb reach */
}

/* Generous spacing between interactive elements */
.action-buttons {
  gap: 16px; /* Prevent mis-taps */
}
```

### 2. Progressive Enhancement

**Mobile Base → Tablet → Desktop**

```tsx
// Mobile-first responsive design
<div className="
  /* Mobile (default) */
  grid grid-cols-1 gap-4 p-4
  
  /* Tablet (768px+) */
  md:grid-cols-2 md:gap-6 md:p-6
  
  /* Desktop (1024px+) */
  lg:grid-cols-3 lg:gap-8 lg:p-8
">
```

### 3. Performance Budget

**Target Metrics:**
- First Contentful Paint: < 1.2s
- Time to Interactive: < 3.5s
- Total Page Weight: < 300KB (initial)
- JavaScript Bundle: < 100KB (gzipped)

## Key Mobile Features

### 1. Gesture Navigation

```tsx
// Swipeable category tabs
import { useSwipeable } from 'react-swipeable';

export const CategoryTabs = () => {
  const handlers = useSwipeable({
    onSwipedLeft: () => nextCategory(),
    onSwipedRight: () => previousCategory(),
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });
  
  return (
    <div {...handlers} className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4">
        {categories.map(cat => (
          <CategoryTab key={cat.id} {...cat} />
        ))}
      </div>
    </div>
  );
};
```

### 2. Optimistic UI Updates

```tsx
// Instant feedback for votes
const handleVote = async (value: 1 | -1) => {
  // Update UI immediately
  setOptimisticVote(value);
  setOptimisticScore(score + value);
  
  try {
    await api.vote(threadId, value);
  } catch (error) {
    // Revert on failure
    setOptimisticVote(null);
    setOptimisticScore(score);
    toast.error('Vote failed, please try again');
  }
};
```

### 3. Smart Loading States

```tsx
// Progressive content loading
export const ThreadList = () => {
  return (
    <div className="space-y-4">
      {/* Show skeletons immediately */}
      {loading && !threads.length && (
        <>
          <ThreadSkeleton />
          <ThreadSkeleton />
          <ThreadSkeleton />
        </>
      )}
      
      {/* Render actual content */}
      {threads.map(thread => (
        <ThreadCard key={thread.id} {...thread} />
      ))}
      
      {/* Infinite scroll loader */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-4">
          <Spinner />
        </div>
      )}
    </div>
  );
};
```

### 4. Offline Support

```tsx
// Service Worker for offline reading
// public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/threads/')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(response => {
          return caches.open('threads-v1').then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

## Mobile-Specific UI Patterns

### 1. Bottom Sheet Pattern

```tsx
// Comment actions bottom sheet
export const CommentActions = ({ comment, isOpen, onClose }) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="p-4 space-y-2">
        <button className="w-full p-4 text-left hover:bg-gray-50 rounded-lg">
          <ReplyIcon /> Reply to comment
        </button>
        <button className="w-full p-4 text-left hover:bg-gray-50 rounded-lg">
          <ShareIcon /> Share comment
        </button>
        <button className="w-full p-4 text-left hover:bg-gray-50 rounded-lg">
          <CopyIcon /> Copy text
        </button>
        <button className="w-full p-4 text-left hover:bg-gray-50 rounded-lg">
          <FlagIcon /> Report comment
        </button>
      </div>
    </BottomSheet>
  );
};
```

### 2. Pull-to-Refresh

```tsx
export const RefreshableThreadList = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchThreads();
    setRefreshing(false);
  };
  
  return (
    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <ThreadList />
    </PullToRefresh>
  );
};
```

### 3. Floating Action Button

```tsx
export const CreateThreadFAB = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <Link
      href="/create"
      className={`
        fixed right-4 bottom-20 z-40
        w-14 h-14 bg-primary-red text-white
        rounded-full shadow-lg
        flex items-center justify-center
        transition-transform duration-200
        ${scrolled ? 'scale-0' : 'scale-100'}
      `}
    >
      <PlusIcon className="w-6 h-6" />
    </Link>
  );
};
```

### 4. Contextual Navigation

```tsx
// Thread view header that hides on scroll
export const ScrollHeader = ({ title, category }) => {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setHidden(currentScrollY > 50 && currentScrollY > lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50
      bg-white dark:bg-dark-surface
      transform transition-transform duration-200
      ${hidden ? '-translate-y-full' : 'translate-y-0'}
    `}>
      <div className="flex items-center gap-4 p-4">
        <BackButton />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500">{category}</p>
          <h1 className="text-base font-medium truncate">{title}</h1>
        </div>
      </div>
    </header>
  );
};
```

## Mobile Performance Optimizations

### 1. Image Optimization

```tsx
// Lazy loading with blur placeholder
import Image from 'next/image';

export const ThreadImage = ({ src, alt }) => {
  return (
    <div className="relative w-full aspect-video">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        loading="lazy"
        placeholder="blur"
        blurDataURL={generateBlurDataURL(src)}
        className="object-cover rounded-lg"
      />
    </div>
  );
};
```

### 2. Virtual Scrolling

```tsx
// For long comment threads
import { FixedSizeList } from 'react-window';

export const VirtualCommentList = ({ comments }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <CommentCard comment={comments[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={window.innerHeight - 200}
      itemCount={comments.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 3. Debounced Search

```tsx
// Mobile-optimized search with debouncing
export const MobileSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const debouncedSearch = useMemo(
    () => debounce(async (q: string) => {
      if (q.length > 2) {
        const data = await api.search(q);
        setResults(data);
      }
    }, 500),
    []
  );
  
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);
  
  return (
    <div className="p-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search threads..."
        className="w-full p-3 rounded-lg border"
      />
      {/* Results */}
    </div>
  );
};
```

## PWA Configuration

```javascript
// next.config.js PWA settings
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.itaita\.jp\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
  ],
});
```

## Mobile Testing Strategy

### Device Coverage
- iPhone 12/13/14 (standard)
- iPhone SE (small screen)
- iPhone 14 Pro Max (large)
- Android: Pixel 5, Samsung Galaxy S21

### Key Test Scenarios
1. One-handed navigation
2. Offline mode functionality
3. Slow 3G performance
4. Screen rotation handling
5. Deep linking from notifications

### Performance Testing
```bash
# Lighthouse CI for mobile
lighthouse https://itaita.jp \
  --emulated-form-factor=mobile \
  --throttling-method=simulate \
  --throttling.cpuSlowdownMultiplier=4
```