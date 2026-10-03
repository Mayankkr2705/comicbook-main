# ComicBook - AI-Powered Comic Strip & Story Generator

A full-stack web application that leverages AI to generate creative comic strips and short stories. Users can create, share, and interact with AI-generated content in a social feed environment.

## Features

### AI Generation

- **Comic Strip Generation**: Create multi-panel (1-6 panels) comic strips using AI
- **Story Text Generation**: Generate creative short stories (50-500 words) based on prompts
- **Multiple AI Providers**: Support for Gemini and OpenRouter AI models
- **Cloudinary Integration**: Automatic image hosting and optimization

### User Management

- **JWT Authentication**: Secure local user authentication and authorization
- **User Profiles**: Personal profile pages with user statistics
- **Story Management**: Create, edit, delete, and manage personal stories

### Social Features

- **Public Feed**: Browse all public comic strips and stories
- **Voting System**: Upvote and downvote stories
- **Comments**: Comment on stories and engage with other users
- **Privacy Controls**: Toggle story visibility between public and private
- **Infinite Scroll**: Smooth browsing experience with lazy loading

### Story Features

- **Rich Story Display**: View stories with images, text, and metadata
- **Text-to-Speech**: Listen to stories with browser text-to-speech
- **Story Details Page**: Dedicated page for each story with full content
- **Sequenced Images**: Multi-panel comic strips with proper ordering

### User Interface

- **Modern Design**: Beautiful dark-themed UI with Tailwind CSS
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Smooth loading indicators throughout the app
- **Error Handling**: Graceful error messages and retry mechanisms

## Tech Stack

### Frontend

- **React 19.1.1**: Modern UI library with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS 4.1**: Utility-first CSS framework
- **React Context**: Authentication state and local JWT integration
- **Lucide React**: Beautiful icon library
- **Axios**: HTTP client for API requests

### Backend

- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: Authentication and authorization
- **Cloudinary**: Image hosting and management
- **OpenRouter SDK**: AI model integration
- **JWT**: Token-based authentication

### AI Services

- **OpenRouter API**: Access to multiple AI models
- **Google Gemini 2.5 Flash**: Image and text generation
- **Gemini 2.0 Flash**: Text generation

## Project Structure

```
comicbook/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js       # Cloudinary configuration
│   │   │   └── database.js         # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── aiController.js     # AI generation logic
│   │   │   ├── commentController.js # Comment CRUD operations
│   │   │   ├── userController.js   # User management
│   │   │   └── voteController.js   # Voting system
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT authentication
│   │   │   ├── authorization.js    # Authorization checks
│   │   │   ├── errorHandler.js     # Error handling
│   │   │   └── validation.js       # Input validation
│   │   ├── models/
│   │   │   ├── Comment.js          # Comment schema
│   │   │   ├── Story.js            # Story schema
│   │   │   ├── User.js             # User schema
│   │   │   └── Vote.js             # Vote schema
│   │   ├── routes/
│   │   │   ├── ai.js               # AI generation routes
│   │   │   ├── comment.js          # Comment routes
│   │   │   ├── story.js            # Story routes
│   │   │   └── user.js             # User routes
│   │   └── server.js               # Express app entry point
│   ├── package.json
│   └── STORY_API.md                # API documentation
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIImageGenerator.jsx    # AI image generation component
│   │   │   ├── AppLayout.jsx           # Main layout wrapper
│   │   │   ├── ComicGenerator.jsx      # Comic creation interface
│   │   │   ├── CommentInput.jsx        # Comment input form
│   │   │   ├── CommentSection.jsx      # Comments display
│   │   │   ├── LoginButton.jsx         # Login control
│   │   │   ├── LogoutButton.jsx        # Logout control
│   │   │   ├── Profile.jsx             # User profile component
│   │   │   ├── PublicPosts.jsx         # Public stories grid
│   │   │   ├── StoryCard.jsx           # Individual story card
│   │   │   ├── StoryGenerator.jsx      # Text story generator
│   │   │   ├── StoryGrid.jsx           # Story grid layout
│   │   │   ├── TextToSpeech.jsx        # TTS functionality
│   │   │   ├── Toast.jsx               # Toast notification
│   │   │   ├── ToastContainer.jsx      # Toast manager
│   │   │   └── VoteButtons.jsx         # Upvote/downvote buttons
│   │   ├── hooks/
│   │   │   ├── useInfiniteScroll.js    # Infinite scroll hook
│   │   │   └── useToast.js             # Toast notification hook
│   │   ├── pages/
│   │   │   ├── FeedPage.jsx            # Public feed page
│   │   │   ├── ProfilePage.jsx         # User profile page
│   │   │   └── StoryDetailPage.jsx     # Story detail view
│   │   ├── services/
│   │   │   ├── aiService.js            # AI API calls
│   │   │   ├── authService.js          # Auth helpers
│   │   │   ├── commentService.js       # Comment API calls
│   │   │   ├── storyService.js         # Story API calls
│   │   │   └── userService.js          # User API calls
│   │   ├── App.jsx                     # Root component
│   │   ├── main.jsx                    # App entry point
│   │   └── index.css                   # Global styles
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- MongoDB account or local MongoDB installation
- OpenRouter API key
- Cloudinary account

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Local JWT authentication
# No frontend authentication provider configuration is required.

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

4. Start the development server:

```bash
npm run dev
```

The backend server will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory:

```env
VITE_API_BASE=http://localhost:3000
```

4. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

### Creating a Comic Strip

1. Sign in using the local email and password form
2. Navigate to the "Create" page
3. Enter a creative prompt describing your comic
4. Select the AI provider (Gemini or OpenRouter)
5. Choose the number of panels (1-6)
6. Click "Generate Comic"
7. Add a title and description
8. Choose visibility (public or private)
9. Save your comic strip

### Generating a Story

1. Sign in to your account
2. Navigate to the "Story Generator" page
3. Enter a story prompt
4. Set the maximum word count (50-500 words)
5. Click "Generate Story"
6. Review and edit the generated story
7. Save with title, description, and visibility settings

### Interacting with Stories

- **Browse Feed**: View all public stories on the feed page
- **Vote**: Click upvote or downvote buttons on stories
- **Comment**: Add comments to any story
- **View Details**: Click on a story to see full details
- **Listen**: Use text-to-speech to listen to stories
- **Share**: Public stories can be accessed via direct link

### Managing Your Content

- **Profile Page**: View all your created stories
- **Edit Stories**: Update title, description, or visibility
- **Delete Stories**: Remove stories you no longer want
- **Toggle Privacy**: Switch between public and private visibility

## API Endpoints

### AI Generation

- `POST /ai/generate-comic` - Generate comic strip images
- `POST /ai/generate-story` - Generate story text

### Stories

- `GET /stories/public` - Get all public stories
- `GET /stories/my-stories` - Get user's stories (authenticated)
- `GET /stories/:id` - Get single story
- `POST /stories` - Create new story (authenticated)
- `PUT /stories/:id` - Update story (authenticated)
- `DELETE /stories/:id` - Delete story (authenticated)
- `PATCH /stories/:id/visibility` - Update visibility (authenticated)

### Voting

- `POST /stories/:id/upvote` - Upvote a story (authenticated)
- `POST /stories/:id/downvote` - Downvote a story (authenticated)
- `GET /stories/:id/vote-status` - Get user's vote on a story (authenticated)

### Comments

- `GET /stories/:storyId/comments` - Get all comments for a story
- `POST /stories/:storyId/comments` - Create a comment (authenticated)
- `PUT /comments/:id` - Update a comment (authenticated)
- `DELETE /comments/:id` - Delete a comment (authenticated)

### Users

- `GET /users/profile` - Get user profile (authenticated)
- `GET /users/profile` - Get the authenticated user's profile

For detailed API documentation, see `backend/STORY_API.md`

## Database Schema

### User Model

- `_id`: MongoDB ObjectId user ID
- `username`: String (unique, required)
- `email`: String (unique)
- `stories`: Array of Story references
- `timestamps`: createdAt, updatedAt

### Story Model

- `title`: String (required, max 200 chars)
- `description`: String (max 1000 chars)
- `content`: String (max 5000 chars)
- `images`: Array of { url, sequenceIndex }
- `visibility`: Enum ['public', 'private']
- `upvotes`: Number (default 0)
- `downvotes`: Number (default 0)
- `author`: String (User reference)
- `timestamps`: createdAt, updatedAt

### Comment Model

- `story`: ObjectId (Story reference)
- `author`: String (User reference)
- `content`: String (required, max 500 chars)
- `timestamps`: createdAt, updatedAt

### Vote Model

- `story`: ObjectId (Story reference)
- `user`: String (User reference)
- `voteType`: Enum ['upvote', 'downvote']
- `timestamps`: createdAt, updatedAt

## Features in Detail

### Authentication & Authorization

- Secure JWT-based local authentication
- Protected routes requiring valid access tokens
- Role-based authorization for resource access
- User creation during registration
- Session management using a stored JWT

### AI Content Generation

- Multi-provider support (Gemini, OpenRouter)
- Configurable panel count (1-6 panels)
- Sequential image generation for comic strips
- Word count control for story generation (50-500 words)
- Automatic Cloudinary upload and optimization
- Error handling and retry mechanisms
- Rate limiting protection

### Social Interactions

- Real-time voting with immediate UI feedback
- Nested comment threads
- User activity tracking
- Public/private content control
- Author-only edit/delete permissions

### Performance Optimizations

- Infinite scroll with lazy loading
- Image optimization via Cloudinary
- Database indexing for fast queries
- Request caching where applicable
- Efficient React component rendering

## Environment Variables

### Backend Required Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret used to sign local authentication tokens
- `OPENROUTER_API_KEY` - OpenRouter API key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Frontend Required Variables

- `VITE_API_BASE` - Backend API URL

## Deployment

### Backend Deployment

1. Set up MongoDB database (MongoDB Atlas recommended)
2. Configure environment variables on hosting platform
3. Deploy to your preferred hosting service (Heroku, Railway, etc.)
4. Update CORS settings with production frontend URL

### Frontend Deployment

1. Update API URL in environment variables
2. Build production bundle: `npm run build`
3. Deploy to static hosting (Vercel, Netlify, etc.)
4. Configure CORS with the production frontend domain

## Development

### Running in Development Mode

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

### Building for Production

Backend:

```bash
cd backend
npm start
```

Frontend:

```bash
cd frontend
npm run build
npm run preview
```

### Code Style

- ESLint configuration for consistent code style
- Prettier for code formatting (recommended)
- Follow React best practices and hooks guidelines

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   - Verify the email and password are correct
   - Ensure the backend JWT secret is configured consistently

2. **AI Generation Failures**

   - Verify OpenRouter API key is valid
   - Check API rate limits
   - Ensure Cloudinary credentials are configured

3. **Database Connection Issues**

   - Verify MongoDB URI is correct
   - Check network access settings in MongoDB Atlas
   - Ensure IP whitelist includes your server

4. **CORS Errors**
   - Add frontend URL to ALLOWED_ORIGINS
   - Verify CORS configuration in backend
   - Check browser console for specific errors

## Future Enhancements

- User following and followers system
- Story collections and albums
- Advanced search and filtering
- Story templates and themes
- Collaborative story creation
- Story remixing and variations
- Mobile application (React Native)
- Story export (PDF, image formats)
- Social sharing integration
- Advanced AI customization options

## License

This project is developed by Team Dev Null for educational purposes.

## Acknowledgments

- JWT for authentication services
- OpenRouter for AI model access
- Cloudinary for image hosting
- MongoDB for database services
- The open-source community for amazing tools and libraries

## Support

For issues, questions, or contributions, please contact any team member:

- Rahul Naithani: [github.com/claynade](https://github.com/claynade)
- Tanmay Gupta: [github.com/tanmay0215](https://github.com/tanmay0215)
- Mohit Maulekhi: [github.com/MohitMaulekhi](https://github.com/MohitMaulekhi)
- Mayank Kumar: [https://github.com/Mayankkr2705](https://github.com/Mayankkr2705)



Built with ❤️ by Team Devnull
