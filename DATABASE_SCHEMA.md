# Itaita Database Schema Design

## Overview

This document details the database schema for the Itaita platform, designed to support a Reddit-style discussion forum with Japanese cultural considerations. The schema prioritizes performance, scalability, and data integrity.

## Database Choice: PostgreSQL

**Rationale:**
- Excellent support for complex queries and full-text search in Japanese
- JSONB support for flexible metadata storage
- Strong ACID compliance for data integrity
- Proven scalability for similar platforms
- Built-in support for UUID generation

## Schema Design

### Users and Authentication

```sql
-- Users table: Core user information
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    username VARCHAR(50) UNIQUE,
    display_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile
    bio TEXT,
    avatar_url VARCHAR(500),
    
    -- Stats
    karma_score INTEGER DEFAULT 0,
    post_karma INTEGER DEFAULT 0,
    comment_karma INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    banned_until TIMESTAMP,
    
    -- Preferences (JSONB for flexibility)
    preferences JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_karma ON users(karma_score DESC);

-- Sessions for authentication
CREATE TABLE sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

### Categories and Threads

```sql
-- Categories (sub-boards like gaming, career, etc.)
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_ja VARCHAR(100) NOT NULL, -- Japanese name
    description TEXT,
    description_ja TEXT,
    icon_url VARCHAR(500),
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    is_nsfw BOOLEAN DEFAULT FALSE,
    allows_anonymous BOOLEAN DEFAULT TRUE,
    min_karma_to_post INTEGER DEFAULT 0,
    
    -- Stats
    subscriber_count INTEGER DEFAULT 0,
    thread_count INTEGER DEFAULT 0,
    
    -- Metadata
    rules JSONB DEFAULT '[]', -- Array of rule objects
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_subscriber_count ON categories(subscriber_count DESC);

-- User subscriptions to categories
CREATE TABLE category_subscriptions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, category_id)
);

-- Threads (main posts)
CREATE TABLE threads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Content
    title VARCHAR(300) NOT NULL,
    content TEXT,
    content_type VARCHAR(20) DEFAULT 'text', -- text, link, image
    link_url VARCHAR(1000),
    
    -- Anonymous posting
    is_anonymous BOOLEAN DEFAULT FALSE,
    anonymous_name VARCHAR(50), -- Optional pseudonym
    
    -- Stats
    score INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_removed BOOLEAN DEFAULT FALSE,
    removed_reason TEXT,
    removed_by UUID REFERENCES users(id),
    
    -- Metadata
    tags TEXT[], -- Array of tags
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_threads_category_id ON threads(category_id);
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_score ON threads(score DESC);
CREATE INDEX idx_threads_created_at ON threads(created_at DESC);
CREATE INDEX idx_threads_last_activity ON threads(last_activity_at DESC);
CREATE INDEX idx_threads_hot_ranking ON threads(
    score DESC, 
    created_at DESC
) WHERE is_removed = FALSE;

-- Full-text search
CREATE INDEX idx_threads_search ON threads 
USING gin(to_tsvector('japanese', title || ' ' || COALESCE(content, '')));
```

### Comments System

```sql
-- Comments with nested structure
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Content
    content TEXT NOT NULL,
    
    -- Anonymous posting
    is_anonymous BOOLEAN DEFAULT FALSE,
    anonymous_name VARCHAR(50),
    
    -- Hierarchical data
    path LTREE, -- For efficient nested queries
    depth INTEGER DEFAULT 0,
    
    -- Stats
    score INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_removed BOOLEAN DEFAULT FALSE,
    removed_reason TEXT,
    removed_by UUID REFERENCES users(id),
    
    -- Edit tracking
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_comments_thread_id ON comments(thread_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_path ON comments USING gist(path);
CREATE INDEX idx_comments_score ON comments(score DESC);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

### Voting System

```sql
-- Votes for threads and comments
CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    votable_id UUID NOT NULL,
    votable_type VARCHAR(20) NOT NULL CHECK (votable_type IN ('thread', 'comment')),
    vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 1)),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, votable_id, votable_type)
);

CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_votable ON votes(votable_id, votable_type);
```

### Moderation System

```sql
-- Reports from users
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL,
    reported_type VARCHAR(20) NOT NULL CHECK (reported_type IN ('thread', 'comment', 'user')),
    
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported ON reports(reported_id, reported_type);

-- Moderators for categories
CREATE TABLE moderators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    
    -- Permissions as flags
    can_remove_posts BOOLEAN DEFAULT TRUE,
    can_ban_users BOOLEAN DEFAULT FALSE,
    can_edit_category BOOLEAN DEFAULT FALSE,
    
    appointed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, category_id)
);

-- Moderation log
CREATE TABLE moderation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    moderator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    category_id UUID REFERENCES categories(id),
    
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moderation_logs_moderator ON moderation_logs(moderator_id);
CREATE INDEX idx_moderation_logs_target ON moderation_logs(target_id, target_type);
```

### Notifications

```sql
-- User notifications
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL, -- reply, mention, upvote, etc.
    title VARCHAR(200) NOT NULL,
    body TEXT,
    
    -- Related entities
    related_id UUID,
    related_type VARCHAR(20),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery
    is_email_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) 
WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### Analytics and Metrics

```sql
-- Thread views tracking
CREATE TABLE thread_views (
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Use composite primary key to prevent duplicate counting
    PRIMARY KEY (thread_id, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), ip_address, DATE(viewed_at))
);

-- Daily statistics
CREATE TABLE daily_stats (
    date DATE PRIMARY KEY,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_threads INTEGER DEFAULT 0,
    new_comments INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Database Functions and Triggers

```sql
-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
-- Update thread activity on new comment
CREATE OR REPLACE FUNCTION update_thread_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE threads 
    SET last_activity_at = CURRENT_TIMESTAMP,
        comment_count = comment_count + 1
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_thread_on_comment AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION update_thread_activity();

-- Update karma scores
CREATE OR REPLACE FUNCTION update_user_karma()
RETURNS TRIGGER AS $$
DECLARE
    content_owner_id UUID;
    karma_change INTEGER;
BEGIN
    -- Determine karma change
    karma_change := CASE 
        WHEN NEW.vote_value = 1 THEN 1
        WHEN NEW.vote_value = -1 THEN -1
        ELSE 0
    END;
    
    -- Get content owner
    IF NEW.votable_type = 'thread' THEN
        SELECT user_id INTO content_owner_id FROM threads WHERE id = NEW.votable_id;
    ELSIF NEW.votable_type = 'comment' THEN
        SELECT user_id INTO content_owner_id FROM comments WHERE id = NEW.votable_id;
    END IF;
    
    -- Update karma if owner exists
    IF content_owner_id IS NOT NULL THEN
        UPDATE users 
        SET karma_score = karma_score + karma_change,
            post_karma = CASE 
                WHEN NEW.votable_type = 'thread' 
                THEN post_karma + karma_change 
                ELSE post_karma 
            END,
            comment_karma = CASE 
                WHEN NEW.votable_type = 'comment' 
                THEN comment_karma + karma_change 
                ELSE comment_karma 
            END
        WHERE id = content_owner_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_karma_on_vote AFTER INSERT ON votes
    FOR EACH ROW EXECUTE FUNCTION update_user_karma();
```

## Migration Strategy

### Initial Setup
1. Create database and enable required extensions
2. Run schema creation in order (users → categories → threads → comments → etc.)
3. Create all indexes after initial data load for better performance

### Future Considerations
1. **Partitioning**: Partition large tables (votes, thread_views) by date
2. **Sharding**: Prepare for horizontal sharding by category_id
3. **Read Replicas**: Set up read replicas for heavy read operations
4. **Archival**: Move old threads to archive tables after 1 year

## Performance Optimizations

1. **Connection Pooling**: Use PgBouncer for connection management
2. **Query Optimization**: Regular EXPLAIN ANALYZE on slow queries
3. **Vacuum Schedule**: Daily vacuum analyze on high-write tables
4. **Index Maintenance**: Weekly index rebuilds for fragmented indexes

## Backup Strategy

1. **Continuous Archiving**: WAL archiving to S3
2. **Daily Backups**: Full backup with pg_dump
3. **Point-in-Time Recovery**: Keep 7 days of WAL files
4. **Disaster Recovery**: Cross-region backup replication