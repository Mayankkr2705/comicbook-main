# Implementation Plan

- [x] 1. Enhance data models and create new models for voting and comments





  - Create Vote model with story reference, user reference, and vote type
  - Create Comment model with story reference, author reference, and content
  - Add title and description fields to Story model
  - Add indexes for performance optimization (story+user unique index on Vote, story index on Comment)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 10.1_

- [x] 2. Implement voting system backend





  - [x] 2.1 Create vote controller with voteStory and removeVote methods


    - Implement logic to check existing vote and handle vote type changes
    - Update Story upvotes/downvotes counts atomically
    - Create or update Vote document with user and story references
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_
  - [x] 2.2 Add vote routes to story router


    - POST /stories/:id/vote with voteType in body
    - DELETE /stories/:id/vote to remove user's vote
    - Apply authentication middleware to protect routes
    - _Requirements: 5.1, 6.1, 10.4_
  - [x] 2.3 Update getStoryById to include user's current vote status


    - Query Vote collection to find user's vote for the story
    - Include voteType in response if user has voted
    - _Requirements: 5.1, 5.5, 6.1, 6.5_

- [x] 3. Implement comment system backend





  - [x] 3.1 Create comment controller with CRUD operations


    - Implement getComments to fetch all comments for a story with author details
    - Implement createComment to add new comment with validation
    - Implement deleteComment with ownership verification
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 3.2 Create comment routes

    - GET /stories/:storyId/comments to retrieve comments
    - POST /stories/:storyId/comments to create comment
    - DELETE /stories/:storyId/comments/:commentId to delete comment
    - Apply authentication middleware to POST and DELETE routes
    - _Requirements: 7.1, 7.2, 7.5, 10.4_
  - [x] 3.3 Add comment count to story responses


    - Update getPublicStories to include comment count
    - Update getStoryById to include comment count
    - Use aggregation or virtual populate for efficient counting
    - _Requirements: 4.4, 7.2_

- [x] 4. Enhance AI generation endpoint





  - [x] 4.1 Update AI controller to accept prompt, provider, and panel count


    - Modify generateComic to accept request body with prompt, provider selection, and panels
    - Implement provider-specific logic for Gemini and OpenRouter
    - Generate multiple images based on panel count
    - _Requirements: 2.1, 2.2_
  - [x] 4.2 Update AI route from GET to POST


    - Change /ai/image from GET to POST endpoint
    - Add request body validation for prompt, provider, and panels
    - _Requirements: 2.1, 10.2_
  - [x] 4.3 Add error handling for AI service failures


    - Implement try-catch blocks for external API calls
    - Return user-friendly error messages
    - Log errors for debugging
    - _Requirements: 2.4_

- [x] 5. Enhance story creation and management




  - [x] 5.1 Update createStory to accept title and description


    - Add title and description fields to request body validation
    - Store title and description in Story document
    - _Requirements: 3.1, 3.4_
  - [x] 5.2 Update story responses to include author details


    - Populate author field with username and email in getPublicStories
    - Populate author field in getStoryById
    - _Requirements: 4.4, 9.1_
  - [x] 5.3 Enhance getPublicStories with pagination


    - Add page and limit query parameters
    - Implement skip and limit in MongoDB query
    - Return total count and pagination metadata
    - _Requirements: 4.3_
  - [x] 5.4 Update deleteStory to cascade delete comments and votes


    - Delete all Comment documents referencing the story
    - Delete all Vote documents referencing the story
    - Delete the Story document
    - _Requirements: 9.4_

- [x] 6. Create user management endpoints




  - [x] 6.1 Create user controller with profile operations


    - Implement getCurrentUser to fetch authenticated user's profile
    - Implement updateProfile to update username and email
    - Implement getUserStories to fetch public stories by user ID
    - _Requirements: 1.2, 9.1_
  - [x] 6.2 Create user routes


    - GET /users/me to get current user profile
    - PUT /users/me to update profile
    - GET /users/:id/stories to get user's public stories
    - Apply authentication middleware to protected routes
    - _Requirements: 1.2, 1.4, 9.1_
  - [x] 6.3 Implement user creation/retrieval on authentication


    - Create middleware to find or create user on first login
    - Extract user info from Auth0 JWT
    - Store user in MongoDB with Auth0 ID as _id
    - _Requirements: 1.2_

- [x] 7. Build frontend feed page and components





  - [x] 7.1 Create FeedPage component with infinite scroll


    - Implement useInfiniteScroll hook or library integration
    - Fetch public stories with pagination
    - Display loading states and empty states
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  - [x] 7.2 Create StoryCard component


    - Display comic strip preview image
    - Show author name, avatar, and timestamp
    - Display engagement metrics (upvotes, downvotes, comments)
    - Add click handler to navigate to story detail
    - _Requirements: 4.4, 8.2_
  - [x] 7.3 Implement story service methods for feed


    - Add getPublicStories with pagination parameters
    - Handle API errors and return formatted data
    - _Requirements: 4.1, 4.2_

- [x] 8. Build frontend voting functionality


  - [x] 8.1 Create VoteButtons component


    - Display upvote and downvote buttons with counts
    - Highlight active vote state based on user's vote
    - Implement click handlers to call vote API
    - Show optimistic UI updates
    - _Requirements: 5.1, 5.2, 5.5, 6.1, 6.2, 6.5_
  - [x] 8.2 Add vote methods to story service


    - Implement voteStory(storyId, voteType) method
    - Implement removeVote(storyId) method

    - Handle authentication and errors
    - _Requirements: 5.1, 6.1_
  - [x] 8.3 Integrate VoteButtons into StoryCard and StoryDetailPage

    - Pass story data and vote status to VoteButtons
    - Update local state after vote actions
    - _Requirements: 5.5, 6.5_

- [x] 9. Build frontend comment functionality


  - [x] 9.1 Create CommentSection component


    - Display list of comments with author info and timestamps
    - Show delete button for user's own comments
    - Implement pagination or "load more" for many comments
    - _Requirements: 7.2, 7.4_
  - [x] 9.2 Create CommentInput component


    - Provide textarea for comment content
    - Add submit button with loading state
    - Validate comment content before submission
    - _Requirements: 7.1, 7.3_
  - [x] 9.3 Create comment service


    - Implement getComments(storyId) method
    - Implement createComment(storyId, content) method
    - Implement deleteComment(storyId, commentId) method
    - _Requirements: 7.1, 7.2, 7.5_
  - [x] 9.4 Integrate CommentSection into StoryDetailPage

    - Fetch and display comments when story loads
    - Update comment list after create/delete actions
    - _Requirements: 7.2_

- [x] 10. Enhance comic creation page



  - [x] 10.1 Update ComicGenerator component with new options


    - Add AI provider selector (Gemini/OpenRouter dropdown)
    - Add prompt textarea for user input
    - Add panel count selector (1-6 panels)
    - Update generate button to use POST request with form data
    - _Requirements: 2.1, 2.5_

  - [ ] 10.2 Add title and description inputs to create flow
    - Add title input field
    - Add optional description textarea
    - Pass title and description to createStory API
    - _Requirements: 3.1, 3.4_
  - [x] 10.3 Update AI service to use POST endpoint


    - Change generateComic to send POST request with prompt, provider, and panels
    - Handle response with multiple image URLs

    - _Requirements: 2.1, 2.2_
  - [ ] 10.4 Add preview and publish workflow
    - Display generated comic panels in preview area




    - Show visibility toggle (public/private)
    - Add publish button to create story with all data
    - _Requirements: 2.5, 3.1_

- [x] 11. Build story detail page


  - [ ] 11.1 Create StoryDetailPage component
    - Fetch story by ID from route parameter

    - Display all comic panels in sequence
    - Show author information and timestamp
    - Include VoteButtons component




    - Include CommentSection component
    - _Requirements: 4.4, 5.5, 6.5, 7.2_
  - [ ] 11.2 Add navigation from StoryCard to StoryDetailPage
    - Implement React Router route for /story/:id
    - Add click handler to StoryCard to navigate


    - _Requirements: 8.2_
  - [ ] 11.3 Handle private story access
    - Check if story is private and user is not author

    - Display access denied message for unauthorized access
    - _Requirements: 3.2, 3.3_

- [x] 12. Build user profile page

  - [ ] 12.1 Create ProfilePage component
    - Display user information (username, email)
    - Show tabs for "My Stories" and "Settings"
    - Fetch and display user's stories (both public and private)
    - _Requirements: 9.1, 9.2_
  - [x] 12.2 Create story grid view for profile





    - Display stories in grid layout
    - Show public/private indicators




    - Add edit and delete buttons for each story

    - _Requirements: 9.1, 9.2, 9.3_
  - [ ] 12.3 Implement story visibility toggle
    - Add toggle switch to change story visibility
    - Call updateVisibility API on toggle
    - Update UI to reflect new visibility
    - _Requirements: 9.3, 9.5_
  - [ ] 12.4 Implement story deletion
    - Add delete button with confirmation modal
    - Call deleteStory API on confirmation
    - Remove story from UI after successful deletion
    - _Requirements: 9.4_
  - [ ] 12.5 Add user service methods
    - Implement getCurrentUser() method
    - Implement updateProfile(data) method
    - _Requirements: 1.2, 9.1_

- [ ] 13. Implement navigation and layout
  - [ ] 13.1 Create AppLayout component
    - Build navigation bar with logo and links
    - Add user avatar dropdown with logout option
    - Implement responsive mobile menu
    - _Requirements: 8.1, 8.4_
  - [ ] 13.2 Set up React Router routes
    - Configure routes for Feed, Create, Profile, and StoryDetail pages
    - Add protected route wrapper for authenticated pages
    - _Requirements: 8.1_
  - [ ] 13.3 Style navigation with Tailwind CSS
    - Apply social media-inspired styling
    - Use consistent spacing and colors
    - Ensure mobile responsiveness
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [x] 14. Implement authentication flow enhancements


  - [x] 14.1 Update Auth0 configuration

    - Verify Auth0 domain and audience settings
    - Configure callback URLs for development and production
    - Set up proper scopes for user profile access
    - _Requirements: 1.1, 1.4_
  - [x] 14.2 Enhance authentication error handling


    - Display user-friendly error messages for auth failures
    - Implement retry mechanism for failed authentication
    - Add logout functionality with state cleanup
    - _Requirements: 1.3, 1.5_
  - [x] 14.3 Create user initialization flow

    - Fetch or create user profile on first login
    - Store user data in frontend state/context
    - _Requirements: 1.2_

- [x] 15. Add validation and error handling


  - [x] 15.1 Create backend validation middleware


    - Implement validateStoryInput for story creation/update
    - Implement validateCommentInput for comment content
    - Implement validateVoteInput for vote type
    - _Requirements: 10.2_
  - [x] 15.2 Create authorization middleware


    - Implement isStoryAuthor to verify story ownership
    - Implement isCommentAuthor to verify comment ownership
    - _Requirements: 9.3, 9.4, 7.5_
  - [x] 15.3 Enhance error handling middleware


    - Handle validation errors with 400 status
    - Handle authorization errors with 403 status
    - Handle not found errors with 404 status
    - Return consistent error response format
    - _Requirements: 10.3_
  - [x] 15.4 Add frontend error handling


    - Create toast notification system for errors
    - Add inline error messages for form validation
    - Implement retry buttons for failed requests
    - _Requirements: 2.4_

- [x] 16. Implement UI polish and accessibility


  - [x] 16.1 Add loading states throughout the app

    - Show spinners during API calls
    - Implement skeleton screens for feed loading
    - Add loading indicators on buttons
    - _Requirements: 8.2_
  - [x] 16.2 Create empty state components

    - Design empty state for feed with no stories
    - Design empty state for profile with no stories
    - Design empty state for comments
    - _Requirements: 4.5_
  - [x] 16.3 Implement accessibility features


    - Add ARIA labels to interactive elements
    - Ensure keyboard navigation works
    - Add alt text to all images
    - Test with screen reader
    - _Requirements: 8.1, 8.2_
  - [x] 16.4 Apply consistent styling and theming

    - Define color palette in Tailwind config
    - Create reusable component variants
    - Ensure responsive design on all screen sizes
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [x] 17. Set up environment configuration



  - [x] 17.1 Configure backend environment variables


    - Set up .env file with all required variables
    - Add validation for required environment variables on startup
    - Document all environment variables in README
    - _Requirements: 10.5_
  - [x] 17.2 Configure frontend environment variables


    - Set up .env file with Auth0 and API configuration
    - Update vite.config.js if needed for environment handling
    - _Requirements: 1.1, 1.4_
  - [x] 17.3 Update CORS configuration


    - Ensure CORS allows frontend origin
    - Configure credentials support for cookies if needed
    - _Requirements: 10.4_