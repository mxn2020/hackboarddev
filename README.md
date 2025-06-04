# 🚀 Ultimate Hackathon Template

A production-ready React application template built for rapid development during hackathons. Built with modern technologies and best practices to get you from idea to deployment in minutes.

## 🎯 Perfect For
- Hackathons and rapid prototyping
- SaaS MVPs
- AI-powered applications
- Real-time applications
- Blog platforms
- Note-taking apps

## ⚡ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Netlify Functions (Serverless)
- **Database**: Upstash Redis
- **Authentication**: JWT with bcrypt
- **Deployment**: Netlify
- **Development**: Hot reload, ESLint, TypeScript

## 🌟 Features Out of the Box

### ✅ Authentication System
- User registration and login
- JWT-based authentication
- Protected routes
- Admin role system
- Profile management

### ✅ Content Management
- Personal notes with categories and tags
- Public/private note visibility
- Blog system with admin controls
- Markdown support
- Rich text editing

### ✅ Real-time Examples
- Redis counter (atomic operations)
- Guestbook (LPUSH/LRANGE)
- Live data updates

### ✅ Modern UI/UX
- Dark/light theme toggle
- Responsive design (mobile-first)
- Sidebar/header navigation layouts
- Loading states and error handling
- Particle background animations

### ✅ Developer Experience
- TypeScript for type safety
- Hot module replacement
- Built-in test suite
- Console testing commands
- ESLint configuration

## 🚀 Quick Start

### Method 1: Bolt.new (Recommended)
1. Visit [bolt.new](https://bolt.new)
2. Fork this repository
3. Create new project from your fork
4. Follow setup steps below

### Method 2: Traditional Setup
```bash
git clone https://github.com/yourusername/hackathon-template
cd hackathon-template
npm install
```

## 🔧 Configuration

### 1. Create Upstash Redis Database
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create new Redis database
3. Copy the REST URL and Token

### 2. Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Deploy with default settings
3. Note your Netlify URL (e.g., `https://your-app.netlify.app`)

### 3. Environment Variables
Create `.env` file in root:

```env
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key

# Frontend API URL
VITE_API_BASE_URL=https://your-app.netlify.app/.netlify/functions
```

### 4. Netlify Environment Variables
Copy all variables from `.env` to Netlify:
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add each variable from your `.env` file
3. Redeploy your site

### 5. Create Admin User
```bash
# In your project terminal
npm run create_admin
```

Default admin credentials:
- Email: `admin@example.com`
- Password: `admin123`

## 🛠️ Development

```bash
# Start development server
npm run dev

# Start Netlify development (with functions)
npm run dev:netlify

# Build for production
npm run build

# Run tests
npm run test-api

# Create admin user
npm run create_admin

# Manage blog posts
npm run manage-blog list
npm run manage-blog delete-all
```

## 🧪 Testing Features

### Console Testing
Open browser console and try:
```javascript
// Test profile updates
appTests.testProfileUpdate()

// Check responsive design
appTests.testViewportSize()

// Test navigation layout switching
appTests.testNavigationLayout()

// Measure performance
appTests.testPerformance()

// Run all tests
appTests.runAllTests()
```

### Built-in Test Page
Visit `/test` in your app for GUI testing tools.

## 📁 Project Structure

```
├── netlify/
│   └── functions/           # Serverless functions
│       ├── auth/           # Authentication endpoints
│       ├── blog/           # Blog management
│       ├── notes/          # Notes management
│       ├── counter/        # Example: Redis counter
│       └── guestbook/      # Example: Redis guestbook
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── shared/        # Common components
│   │   └── layout/        # Layout components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Page components
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── scripts/               # Utility scripts
└── public/               # Static assets
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `DELETE /auth/logout` - Logout

### Notes (Protected)
- `GET /notes` - List user notes
- `POST /notes` - Create note
- `GET /notes/:id` - Get specific note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note

### Blog
- `GET /blog` - List all posts (public)
- `GET /blog/:slug` - Get specific post (public)
- `POST /blog` - Create post (auth required)
- `PUT /blog/:slug` - Update post (auth required)
- `DELETE /blog/:slug` - Delete post (auth required)

### Examples
- `GET /counter` - Get counter value
- `POST /counter` - Increment counter
- `DELETE /counter` - Reset counter
- `GET /guestbook` - Get guestbook entries
- `POST /guestbook` - Add guestbook entry

## 🎨 Customization

### Theme Colors
Edit `src/index.css` to change color scheme:
```css
:root {
  --primary: your-color;
  --secondary: your-color;
  /* ... */
}
```

### Add New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/layout/`

### Add New API Endpoints
1. Create function in `netlify/functions/`
2. Add package.json if needed
3. Update API calls in frontend

### Database Schema
This template uses Redis with these patterns:
```
user:{userId}                    # User data
user:email:{email}              # Email to user ID mapping
note:{noteId}                   # Note data
user:{userId}:notes             # User's note IDs list
blog:post:{slug}                # Blog post data
blog:posts_list                 # List of post slugs
```

## 🚢 Deployment

### Netlify (Automatic)
1. Push to your connected GitHub repository
2. Netlify automatically deploys
3. Functions are deployed automatically

### Manual Deployment
```bash
npm run build
netlify deploy --prod
```

## 🔍 Troubleshooting

### Common Issues

**Functions not working locally:**
```bash
# Use Netlify dev instead of vite dev
npm run dev:netlify
```

**Redis connection issues:**
- Ensure UPSTASH_REDIS_REST_URL includes `https://`
- Check token is correctly set
- Verify Redis database is active

**Authentication not working:**
- Check JWT_SECRET is set
- Verify API base URL is correct
- Clear localStorage and try again

**Build failures:**
- Check TypeScript errors: `npm run type-check`
- Verify all environment variables are set in Netlify

### Debug Mode
Enable debug logging by adding to your `.env`:
```env
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

MIT License - feel free to use this template for your projects!

## 🆘 Support

- Create an issue on GitHub
- Check the troubleshooting section
- Review the built-in test suite at `/test`

## 🚀 What's Next?

Check out the [Feature Roadmap](#) for ideas on what to build next with this template!

---

**Happy Hacking! 🎉**

Built with ❤️ for the developer community.