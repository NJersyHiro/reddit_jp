-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "ltree";

-- Create custom types
CREATE TYPE vote_value AS ENUM ('1', '-1');
CREATE TYPE content_type AS ENUM ('text', 'link', 'image');
CREATE TYPE report_status AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');
CREATE TYPE notification_type AS ENUM ('reply', 'mention', 'upvote', 'thread_reply', 'moderator_action');

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE itaita_dev TO itaita_user;