# Design Document: Comic Social Platform

## Overview

The Comic Social Platform is a full-stack web application that enables children to create, share, and interact with AI-generated comic strips. The system consists of a React frontend with Auth0 authentication, an Express.js backend API, and MongoDB for data persistence. The platform integrates with external AI services (Gemini and OpenRouter) for comic generation and Cloudinary for image storage.

### Technology Stack

**Frontend:**
- React 19 with Vite
- Tailwind CSS for styling
- Auth0 React SDK for authentication
- Lucide React for icons
- Axios for API communication

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- Auth0 JWT validation (express-jwt, jwks-rsa)
- Cloudinary for image storage
- OpenRouter SDK and Axios for AI service integration

**External Services:**
- Auth0 for authentication and user management
- Cloudinary for image hosting and CDN
- Gemini AI for comic generation
- OpenRouter for alternative AI comic generation

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Feed View  │  │ Create View  │  │ Profile View │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Auth0 React SDK (Authentication)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS + JWT
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Express.js)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         JWT Validation Middleware (Auth0)            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Story Routes  │  │  AI Routes   │  │ User Routes  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Story Ctrl    │  │   AI Ctrl    │  │  User Ctrl   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │   MongoDB        │  │  External APIs   │
         │  ┌────────────┐  │  │  ┌────────────┐  │
         │  │   Users    │  │  │  │  Gemini    │  │
         │  ├────────────┤  │  │  ├────────────┤  │
         │  │  Stories   │  │  │  │ OpenRouter │  │
         │  ├────────────┤  │  │  ├────────────┤  │
         │  │  Comments  │  │  │  │ Cloudinary │  │
         │  ├────────────┤  │  │  └────────────┘  │
         │  │   Votes    │  │  │                  │
         │  └────────────┘  │  └──────────────────┘
         └──────────────────┘
```

### Authentication Flow

```
User → Frontend → Auth0 Login → Auth0 Returns JWT
                                        │
                                        ▼
Frontend stores JWT → API Request with JWT in Header
                                        │
                                        ▼
Backend validates JWT with Auth0 JWKS → Process Request
```

## Components and Interfaces

### Backend Components

#### 1. Data Models

**User Model** (existing - needs enhancement)
```javascript
{
  _id: String,              // Auth0 user ID
  username: String,
  email: String,
  stories: [ObjectId],      // References to Story documents
  createdAt: Date,
  updatedAt: Date
}
```

**Story Model** (existing - needs enhancement for comments)
```javascript
{
  _id: ObjectId,
  images: [{
    url: String,
    sequenceIndex: Number   // Order of panels in comic strip
  }],
  visibility: String,       // 'public' or 'private'
  upvotes: Number,
  downvotes: Number,
  author: String,           // Reference to User._id (Auth0 ID)
  title: String,            // NEW: Comic strip title
  description: String,      // NEW: Optional description
  createdAt: Date,
  updatedAt: Date
}
```

**Comment Model** (NEW)
```javascript
{
  _id: ObjectId,
  story: ObjectId,          // Reference to Story
  author: String,           // Reference to User._id (Auth0 ID)
  content: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Vote Model** (NEW - for tracking individual user votes)
```javascript
{
  _id: ObjectId,
  story: ObjectId,          // Reference to Story
  user: String,             // Reference to User._id (Auth0 ID)
  voteType: String,         // 'upvote' or 'downvote'
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. API Routes

**Story Routes** (`/stories`)
- `GET /public` - Get all public stories (paginated)
- `GET /my-stories` - Get authenticated user's stories (protected)
- `GET /:id` - Get single story with comments
- `POST /` - Create new story (protected)
- `PUT /:id` - Update story (protected, author only)
- `DELETE /:id` - Delete story (protected, author only)
- `PATCH /:id/visibility` - Update visibility (protected, author only)
- `POST /:id/vote` - Vote on story (protected) - NEW endpoint
- `DELETE /:id/vote` - Remove vote (protected) - NEW endpoint

**Comment Routes** (`/stories/:storyId/comments`) - NEW
- `GET /` - Get all comments for a story
- `POST /` - Create comment (protected)
- `DELETE /:commentId` - Delete comment (protected, author only)

**AI Routes** (`/ai`)
- `GET /test` - Test endpoint
- `POST /generate` - Generate comic strip (protected) - ENHANCED
  - Body: `{ prompt: String, provider: 'gemini' | 'openrouter', panels: Number }`

**User Routes** (`/users`) - NEW
- `GET /me` - Get current user profile (protected)
- `PUT /me` - Update user profile (protected)
- `GET /:id/stories` - Get public stories by user ID

#### 3. Controllers

**StoryController**
- `getPublicStories()` - Fetch paginated public stories with author info
- `getMyStories()` - Fetch user's own stories
- `getStoryById()` - Fetch single story with comments and vote status
- `createStory()` - Create story and update user's stories array
- `updateStory()` - Update story (validate ownership)
- `deleteStory()` - Delete story and associated comments/votes
- `updateVisibility()` - Toggle public/private
- `voteStory()` - Handle upvote/downvote logic
- `removeVote()` - Remove user's vote

**CommentController** - NEW
- `getComments()` - Fetch comments for a story
- `createComment()` - Add comment to story
- `deleteComment()` - Delete comment (validate ownership)

**AIController**
- `generateComic()` - Generate comic using selected AI provider
- `uploadToCloudinary()` - Upload generated images to Cloudinary

**UserController** - NEW
- `getCurrentUser()` - Get authenticated user's profile
- `updateProfile()` - Update user information
- `getUserStories()` - Get public stories by user

#### 4. Middleware

**Authentication Middleware** (existing)
- `checkJwt` - Validate JWT token with Auth0
- `addUserInfo` - Extract user info from JWT
- `checkAuth` - Ensure user is authenticated

**Validation Middleware** - NEW
- `validateStoryInput` - Validate story creation/update data
- `validateCommentInput` - Validate comment content
- `validateVoteInput` - Validate vote type

**Authorization Middleware** - NEW
- `isStoryAuthor` - Verify user owns the story
- `isCommentAuthor` - Verify user owns the comment

### Frontend Components

#### 1. Layout Components

**AppLayout**
- Navigation bar with Feed, Create, Profile links
- Auth0 login/logout buttons
- Responsive mobile menu
- User avatar dropdown

**NavigationBar**
- Logo/brand
- Navigation links (Feed, Create, Profile)
- Search bar (future enhancement)
- User menu with logout

#### 2. Page Components

**FeedPage**
- Infinite scroll feed of public stories
- Story cards with engagement metrics
- Filter/sort options (trending, recent, top)
- Empty state for no stories

**CreatePage**
- AI provider selection (Gemini/OpenRouter)
- Comic prompt input form
- Panel count selector
- Preview generated comic
- Visibility toggle (public/private)
- Publish button

**ProfilePage**
- User information display
- Tabs for "My Stories" and "Settings"
- Grid view of user's stories
- Public/private indicators
- Edit/delete story actions

**StoryDetailPage** - NEW
- Full story display with all panels
- Author information
- Engagement buttons (upvote/downvote)
- Comment section
- Share functionality

#### 3. Feature Components

**StoryCard**
- Comic strip thumbnail/preview
- Author name and avatar
- Timestamp
- Engagement metrics (upvotes, downvotes, comments)
- Quick action buttons
- Click to view full story

**CommentSection** - NEW
- Comment list with author info
- Comment input form
- Delete button for own comments
- Timestamp display
- Load more comments pagination

**VoteButtons** - NEW
- Upvote button with count
- Downvote button with count
- Active state for user's vote
- Optimistic UI updates

**ComicGenerator** (existing - needs enhancement)
- AI provider selector
- Prompt textarea
- Panel count input
- Generate button with loading state
- Preview area for generated panels
- Regenerate option

**StoryVisibilityToggle**
- Public/private switch
- Visual indicator of current state
- Confirmation for visibility changes

#### 4. Shared Components

**Button** - Reusable button with variants
**Card** - Container for content
**Avatar** - User profile image
**Input** - Form input fields
**Textarea** - Multi-line text input
**Modal** - Dialog for confirmations
**LoadingSpinner** - Loading indicator
**EmptyState** - No content placeholder

### Frontend Services

**authService.js** (existing)
- `makeAuthenticatedRequest()` - Wrapper for authenticated API calls
- `getAccessToken()` - Retrieve Auth0 access token

**storyService.js** (existing - needs enhancement)
- `getPublicStories(page, limit)` - Fetch public stories
- `getMyStories()` - Fetch user's stories
- `getStoryById(id)` - Fetch single story
- `createStory(data)` - Create new story
- `updateStory(id, data)` - Update story
- `deleteStory(id)` - Delete story
- `updateVisibility(id, visibility)` - Change visibility
- `voteStory(id, voteType)` - Vote on story - NEW
- `removeVote(id)` - Remove vote - NEW

**commentService.js** - NEW
- `getComments(storyId)` - Fetch comments
- `createComment(storyId, content)` - Add comment
- `deleteComment(storyId, commentId)` - Delete comment

**aiService.js** (existing - needs enhancement)
- `generateComic(prompt, provider, panels)` - Generate comic strip

**userService.js** - NEW
- `getCurrentUser()` - Get current user profile
- `updateProfile(data)` - Update user info
- `getUserStories(userId)` - Get user's public stories

## Data Models

### Database Schema

#### Users Collection
```javascript
{
  _id: "auth0|123456789",
  username: "comic_creator_123",
  email: "user@example.com",
  stories: [ObjectId("story1"), ObjectId("story2")],
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-01T00:00:00Z")
}
```

#### Stories Collection
```javascript
{
  _id: ObjectId("story1"),
  title: "The Adventures of Super Cat",
  description: "A cat discovers superpowers",
  images: [
    { url: "https://cloudinary.com/image1.png", sequenceIndex: 0 },
    { url: "https://cloudinary.com/image2.png", sequenceIndex: 1 },
    { url: "https://cloudinary.com/image3.png", sequenceIndex: 2 }
  ],
  visibility: "public",
  upvotes: 42,
  downvotes: 3,
  author: "auth0|123456789",
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-01T00:00:00Z")
}
```

#### Comments Collection
```javascript
{
  _id: ObjectId("comment1"),
  story: ObjectId("story1"),
  author: "auth0|987654321",
  content: "This is amazing! Love the artwork!",
  createdAt: ISODate("2025-01-01T01:00:00Z"),
  updatedAt: ISODate("2025-01-01T01:00:00Z")
}
```

#### Votes Collection
```javascript
{
  _id: ObjectId("vote1"),
  story: ObjectId("story1"),
  user: "auth0|987654321",
  voteType: "upvote",
  createdAt: ISODate("2025-01-01T00:30:00Z"),
  updatedAt: ISODate("2025-01-01T00:30:00Z")
}
```

### Indexes

**Stories Collection:**
- `{ author: 1, createdAt: -1 }` - User's stories sorted by date
- `{ visibility: 1, createdAt: -1 }` - Public feed sorted by date
- `{ upvotes: -1 }` - Trending stories

**Comments Collection:**
- `{ story: 1, createdAt: 1 }` - Comments for a story sorted by date

**Votes Collection:**
- `{ story: 1, user: 1 }` - Unique constraint to prevent duplicate votes
- `{ user: 1 }` - User's voting history

## Error Handling

### Backend Error Handling Strategy

**Error Types:**
1. **Authentication Errors** (401)
   - Invalid or expired JWT
   - Missing authentication token
   - Auth0 validation failure

2. **Authorization Errors** (403)
   - User not owner of resource
   - Insufficient permissions

3. **Validation Errors** (400)
   - Invalid input data
   - Missing required fields
   - Invalid enum values

4. **Not Found Errors** (404)
   - Story not found
   - User not found
   - Comment not found

5. **External Service Errors** (502/503)
   - AI service unavailable
   - Cloudinary upload failure
   - MongoDB connection issues

6. **Rate Limiting Errors** (429)
   - Too many requests to AI services
   - API rate limits exceeded

**Error Response Format:**
```javascript
{
  error: "Error type",
  message: "Human-readable error message",
  details: {}, // Optional additional context
  timestamp: "2025-01-01T00:00:00Z"
}
```

**Error Handling Middleware:**
```javascript
app.use((err, req, res, next) => {
  // Log error
  console.error('[Error]', err);
  
  // Handle specific error types
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: err.message
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message,
      details: err.errors
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});
```

### Frontend Error Handling

**Error Display Strategy:**
- Toast notifications for transient errors
- Inline error messages for form validation
- Error boundaries for component crashes
- Retry mechanisms for network failures

**Error States:**
- Loading states during API calls
- Error states with retry buttons
- Empty states for no data
- Offline detection and messaging

## Testing Strategy

### Backend Testing

**Unit Tests:**
- Model validation logic
- Controller business logic
- Utility functions
- Middleware functions

**Integration Tests:**
- API endpoint testing
- Database operations
- Authentication flow
- External service mocking

**Test Tools:**
- Jest for test runner
- Supertest for API testing
- MongoDB Memory Server for database testing
- Nock for HTTP mocking

**Test Coverage Goals:**
- Controllers: 80%+
- Models: 90%+
- Middleware: 85%+
- Routes: 75%+

### Frontend Testing

**Unit Tests:**
- Component rendering
- Service functions
- Utility functions
- Custom hooks

**Integration Tests:**
- User flows (create story, comment, vote)
- Authentication flow
- API integration
- State management

**E2E Tests:**
- Complete user journeys
- Cross-browser compatibility
- Mobile responsiveness

**Test Tools:**
- Vitest for unit tests
- React Testing Library
- MSW for API mocking
- Playwright for E2E (optional)

**Test Coverage Goals:**
- Components: 70%+
- Services: 85%+
- Utilities: 90%+

### Testing Priorities

**High Priority:**
1. Authentication and authorization
2. Story creation and visibility
3. Voting system integrity
4. Comment CRUD operations

**Medium Priority:**
1. Feed pagination
2. Profile management
3. Error handling
4. Form validation

**Low Priority:**
1. UI animations
2. Empty states
3. Loading states
4. Accessibility features

## Security Considerations

### Authentication & Authorization
- All protected endpoints validate JWT tokens
- User ownership verified before mutations
- Auth0 handles password security and user management
- Tokens expire and require refresh

### Data Validation
- Input sanitization on all user-generated content
- MongoDB injection prevention via Mongoose
- XSS prevention in comments and descriptions
- File upload validation (size, type)

### API Security
- CORS configured for specific frontend origin
- Rate limiting on AI generation endpoints
- Environment variables for sensitive data
- HTTPS in production

### Privacy
- Private stories only accessible to author
- User emails not exposed in public APIs
- Soft delete for user data retention
- GDPR compliance considerations

## Performance Optimization

### Backend Optimization
- Database indexing for common queries
- Pagination for large result sets
- Caching for public feed (Redis - future)
- Image optimization via Cloudinary
- Connection pooling for MongoDB

### Frontend Optimization
- Lazy loading for routes
- Image lazy loading in feed
- Infinite scroll with virtualization
- Debouncing for search/filter
- Optimistic UI updates for votes
- Service worker for offline support (future)

### AI Generation Optimization
- Queue system for comic generation (future)
- Webhook callbacks for long-running tasks
- Caching of common prompts
- Batch processing for multiple panels

## Deployment Architecture

### Development Environment
- Frontend: Vite dev server (localhost:5173)
- Backend: Node.js (localhost:3000)
- Database: Local MongoDB or MongoDB Atlas
- Auth0: Development tenant

### Production Environment
- Frontend: Static hosting (Vercel/Netlify)
- Backend: Node.js hosting (Railway/Render/AWS)
- Database: MongoDB Atlas
- CDN: Cloudinary for images
- Auth0: Production tenant

### Environment Variables

**Backend (.env):**
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/comic-platform
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
OPENROUTER_API_KEY=your-key
GEMINI_API_KEY=your-key
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
VITE_AUTH0_AUDIENCE=your-api-identifier
VITE_AUTH0_SCOPE=openid profile email
```

## UI/UX Design Patterns

### Feed Layout (Instagram-inspired)
- Vertical scrolling feed
- Card-based story display
- Sticky navigation header
- Bottom navigation for mobile
- Pull-to-refresh on mobile

### Story Card Design
```
┌─────────────────────────────────────┐
│ [@username]  [avatar]    [•••]      │
│ 2 hours ago                         │
├─────────────────────────────────────┤
│                                     │
│     [Comic Strip Image Preview]     │
│                                     │
├─────────────────────────────────────┤
│ [↑ 42] [↓ 3] [💬 15] [Share]       │
├─────────────────────────────────────┤
│ "The Adventures of Super Cat"       │
│ A cat discovers superpowers...      │
└─────────────────────────────────────┘
```

### Create Page Layout
```
┌─────────────────────────────────────┐
│         Create Comic Strip          │
├─────────────────────────────────────┤
│ AI Provider: [Gemini ▼]            │
│                                     │
│ Prompt:                             │
│ ┌─────────────────────────────────┐ │
│ │ Describe your comic story...    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Panels: [3 ▼]                      │
│                                     │
│ Visibility: [Public] [Private]     │
│                                     │
│ [Generate Comic]                    │
│                                     │
│ Preview:                            │
│ ┌─────────────────────────────────┐ │
│ │  [Generated panels appear here] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Publish] [Regenerate]              │
└─────────────────────────────────────┘
```

### Color Scheme (Child-friendly)
- Primary: Bright blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Background: Light gray (#F9FAFB)
- Text: Dark gray (#1F2937)

### Typography
- Headings: Bold, rounded sans-serif
- Body: Clean, readable sans-serif
- Comic text: Comic Sans MS or similar playful font

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast mode support
- Screen reader friendly
- Focus indicators
- Alt text for all images

## Future Enhancements

### Phase 2 Features
- User following system
- Notifications for comments/votes
- Story collections/albums
- Advanced search and filters
- Trending/popular section

### Phase 3 Features
- Direct messaging
- Story collaboration
- Comic templates
- Advanced editing tools
- Mobile app (React Native)

### Phase 4 Features
- Monetization (premium features)
- Creator analytics
- Content moderation tools
- Parental controls
- Educational content integration
