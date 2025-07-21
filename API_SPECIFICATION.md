# Itaita API Specification

## Overview

This document defines the RESTful API for the Itaita platform. The API follows REST principles and returns JSON responses.

## Base URL

```
Development: http://localhost:3000/api/v1
Staging: https://staging-api.itaita.jp/api/v1
Production: https://api.itaita.jp/api/v1
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept-Language: ja (optional, defaults to ja)
```

## Common Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      // Additional error details
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

### Pagination

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_pages": 10,
    "total_count": 200,
    "has_next": true,
    "has_prev": false
  }
}
```

## Endpoints

### Authentication

#### Register

```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "optional_username"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "optional_username",
      "created_at": "2024-01-01T00:00:00Z"
    },
    "token": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token",
      "expires_in": 3600
    }
  }
}
```

#### Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** Same as register

#### Refresh Token

```
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

#### Logout

```
POST /auth/logout
```

**Headers Required:** `Authorization: Bearer <jwt_token>`

### User Management

#### Get Current User

```
GET /auth/me
```

**Headers Required:** `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "username",
    "display_name": "Display Name",
    "karma_score": 150,
    "created_at": "2024-01-01T00:00:00Z",
    "preferences": {
      "language": "ja",
      "theme": "light",
      "email_notifications": true
    }
  }
}
```

#### Update User Profile

```
PUT /users/me
```

**Request Body:**
```json
{
  "display_name": "New Display Name",
  "bio": "About me",
  "preferences": {
    "theme": "dark",
    "email_notifications": false
  }
}
```

### Categories

#### List Categories

```
GET /categories
```

**Query Parameters:**
- `sort`: `popular`, `alphabetical`, `newest` (default: `popular`)
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "slug": "gaming",
      "name": "Gaming",
      "name_ja": "ゲーミング",
      "description": "Discussion about games",
      "description_ja": "ゲームについての議論",
      "icon_url": "https://cdn.itaita.jp/icons/gaming.png",
      "subscriber_count": 15420,
      "thread_count": 3241,
      "is_nsfw": false,
      "allows_anonymous": true
    }
  ],
  "pagination": {...}
}
```

#### Get Category

```
GET /categories/:slug
```

**Response:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "slug": "gaming",
    "name": "Gaming",
    "name_ja": "ゲーミング",
    "description": "Discussion about games",
    "description_ja": "ゲームについての議論",
    "icon_url": "https://cdn.itaita.jp/icons/gaming.png",
    "subscriber_count": 15420,
    "thread_count": 3241,
    "is_nsfw": false,
    "allows_anonymous": true,
    "rules": [
      {
        "id": 1,
        "title": "Be respectful",
        "description": "Treat others with respect"
      }
    ],
    "is_subscribed": true,
    "user_is_moderator": false
  }
}
```

#### Subscribe to Category

```
POST /categories/:slug/subscribe
```

**Headers Required:** `Authorization: Bearer <jwt_token>`

#### Unsubscribe from Category

```
DELETE /categories/:slug/subscribe
```

### Threads

#### List Threads

```
GET /threads
```

**Query Parameters:**
- `category`: Category slug (optional)
- `sort`: `hot`, `new`, `top`, `rising` (default: `hot`)
- `time`: `hour`, `day`, `week`, `month`, `year`, `all` (for `top` sort)
- `page`: Page number
- `per_page`: Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "category": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "slug": "gaming",
        "name": "Gaming"
      },
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "gamer123",
        "karma_score": 150
      },
      "title": "Tips for the new RPG boss",
      "content": "I found a strategy that works...",
      "content_type": "text",
      "score": 245,
      "upvote_count": 250,
      "downvote_count": 5,
      "comment_count": 43,
      "is_anonymous": false,
      "is_pinned": false,
      "is_locked": false,
      "tags": ["tips", "rpg", "boss-fight"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "user_vote": 1 // -1, 0, or 1
    }
  ],
  "pagination": {...}
}
```

#### Get Single Thread

```
GET /threads/:id
```

**Response:** Same as list item with full content

#### Create Thread

```
POST /threads
```

**Request Body:**
```json
{
  "category_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Tips for the new RPG boss",
  "content": "I found a strategy that works...",
  "content_type": "text",
  "is_anonymous": false,
  "anonymous_name": "RPGHunter88", // Optional, only if is_anonymous is true
  "tags": ["tips", "rpg", "boss-fight"]
}
```

**Headers Required:** `Authorization: Bearer <jwt_token>`

#### Update Thread

```
PUT /threads/:id
```

**Request Body:**
```json
{
  "content": "Updated content...",
  "tags": ["tips", "rpg", "boss-fight", "updated"]
}
```

**Note:** Only content and tags can be updated. Title cannot be changed.

#### Delete Thread

```
DELETE /threads/:id
```

### Comments

#### List Comments for Thread

```
GET /threads/:thread_id/comments
```

**Query Parameters:**
- `sort`: `best`, `new`, `old`, `controversial` (default: `best`)
- `depth`: Maximum depth to retrieve (default: 5, max: 10)

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "thread_id": "550e8400-e29b-41d4-a716-446655440002",
      "parent_id": null,
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "commenter1",
        "karma_score": 75
      },
      "content": "Great tips! Here's what worked for me...",
      "score": 45,
      "upvote_count": 47,
      "downvote_count": 2,
      "reply_count": 3,
      "depth": 0,
      "is_anonymous": false,
      "is_edited": false,
      "created_at": "2024-01-01T01:00:00Z",
      "user_vote": 0,
      "replies": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440004",
          "parent_id": "550e8400-e29b-41d4-a716-446655440003",
          "content": "Thanks, this helped!",
          "depth": 1,
          // ... other fields
          "replies": []
        }
      ]
    }
  ]
}
```

#### Create Comment

```
POST /comments
```

**Request Body:**
```json
{
  "thread_id": "550e8400-e29b-41d4-a716-446655440002",
  "parent_id": "550e8400-e29b-41d4-a716-446655440003", // Optional
  "content": "This is my comment",
  "is_anonymous": false,
  "anonymous_name": "Helper123" // Optional
}
```

#### Update Comment

```
PUT /comments/:id
```

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

#### Delete Comment

```
DELETE /comments/:id
```

### Voting

#### Vote on Content

```
POST /votes
```

**Request Body:**
```json
{
  "votable_id": "550e8400-e29b-41d4-a716-446655440002",
  "votable_type": "thread", // or "comment"
  "vote_value": 1 // 1 for upvote, -1 for downvote
}
```

#### Remove Vote

```
DELETE /votes
```

**Request Body:**
```json
{
  "votable_id": "550e8400-e29b-41d4-a716-446655440002",
  "votable_type": "thread"
}
```

### Search

#### Search Content

```
GET /search
```

**Query Parameters:**
- `q`: Search query (required)
- `type`: `thread`, `comment`, `user`, `category` (default: all)
- `category`: Limit to specific category slug
- `sort`: `relevance`, `new`, `top` (default: `relevance`)
- `time`: Time range filter
- `page`: Page number
- `per_page`: Items per page

**Response:**
```json
{
  "data": {
    "threads": [...],
    "comments": [...],
    "users": [...],
    "categories": [...]
  },
  "pagination": {...}
}
```

### Moderation

#### Report Content

```
POST /reports
```

**Request Body:**
```json
{
  "reported_id": "550e8400-e29b-41d4-a716-446655440002",
  "reported_type": "thread", // or "comment", "user"
  "reason": "spam", // spam, harassment, inappropriate, other
  "description": "Additional details about the report"
}
```

#### Moderator Actions

```
POST /moderate/:content_type/:id
```

**Request Body:**
```json
{
  "action": "remove", // remove, lock, pin, ban
  "reason": "Violates community guidelines",
  "duration": 7 // For bans, in days
}
```

**Note:** Only available to moderators of the category

### Notifications

#### Get Notifications

```
GET /notifications
```

**Query Parameters:**
- `unread_only`: Boolean (default: false)
- `type`: Filter by notification type
- `page`: Page number
- `per_page`: Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "type": "reply",
      "title": "New reply to your comment",
      "body": "Someone replied to your comment in 'Tips for the new RPG boss'",
      "related_id": "550e8400-e29b-41d4-a716-446655440004",
      "related_type": "comment",
      "is_read": false,
      "created_at": "2024-01-01T02:00:00Z"
    }
  ],
  "pagination": {...},
  "meta": {
    "unread_count": 5
  }
}
```

#### Mark Notification as Read

```
PUT /notifications/:id/read
```

#### Mark All as Read

```
PUT /notifications/read-all
```

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_REQUIRED | Authentication required |
| INVALID_CREDENTIALS | Invalid email or password |
| USER_NOT_FOUND | User not found |
| CATEGORY_NOT_FOUND | Category not found |
| THREAD_NOT_FOUND | Thread not found |
| COMMENT_NOT_FOUND | Comment not found |
| PERMISSION_DENIED | Insufficient permissions |
| VALIDATION_ERROR | Input validation failed |
| RATE_LIMIT_EXCEEDED | Too many requests |
| SERVER_ERROR | Internal server error |

## Rate Limiting

- **Anonymous users**: 60 requests per minute
- **Authenticated users**: 120 requests per minute
- **Creating content**: 10 posts per hour, 60 comments per hour

Rate limit information is included in response headers:
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 118
X-RateLimit-Reset: 1640995200
```

## Webhooks (Future)

The API will support webhooks for:
- New threads in subscribed categories
- Replies to user's content
- Moderation actions
- Threshold events (karma milestones, etc.)

## API Versioning

The API uses URL versioning. Breaking changes will result in a new version number. Deprecated endpoints will be supported for at least 6 months with warnings in responses.