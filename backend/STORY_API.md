# Story API Endpoints

Base URL: `http://localhost:3000/stories`

## Public Endpoints

### Get All Public Stories
```
GET /stories/public
```
Returns all stories with visibility set to "public".

**Response:**
```json
{
  "success": true,
  "stories": [...]
}
```

### Get Single Story
```
GET /stories/:id
```
Returns a single story by ID. Private stories require authentication and author access.

## Protected Endpoints (Require Authentication)

### Get My Stories
```
GET /stories/my-stories
Headers: Authorization: Bearer <token>
```
Returns all stories created by the authenticated user.

### Create Story
```
POST /stories
Headers: Authorization: Bearer <token>
Body: {
  "images": [{ "url": "https://..." }],
  "visibility": "public" | "private"
}
```

### Update Story
```
PUT /stories/:id
Headers: Authorization: Bearer <token>
Body: {
  "images": [{ "url": "https://..." }],
  "visibility": "public" | "private"
}
```
Only the author can update their story.

### Delete Story
```
DELETE /stories/:id
Headers: Authorization: Bearer <token>
```
Only the author can delete their story.

### Upvote Story
```
POST /stories/:id/upvote
Headers: Authorization: Bearer <token>
```
Increments the upvote count.

### Downvote Story
```
POST /stories/:id/downvote
Headers: Authorization: Bearer <token>
```
Increments the downvote count.

### Update Visibility
```
PATCH /stories/:id/visibility
Headers: Authorization: Bearer <token>
Body: {
  "visibility": "public" | "private"
}
```
Only the author can update visibility.
