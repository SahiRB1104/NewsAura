# 📰 Modern News Aggregator

A sophisticated news aggregation platform built with React, Node.js, and modern web technologies. This application aggregates news from multiple sources, provides intelligent summaries, and offers a seamless reading experience.

![News Aggregator Demo](https://i.ibb.co/j6JRD0L/Screenshot-2024-12-01-220015.png)

## ✨ Features

- 🔄 Real-time news aggregation from multiple trusted sources
- 🤖 AI-powered article summarization
- 📱 Responsive design for all devices
- 🎯 Category-based news filtering
- 🌙 Modern, clean UI with smooth animations
- ⚡ Fast and efficient content delivery
- 🔍 Smart content extraction and cleaning

## 🚀 Tech Stack

### Frontend
- **React** - UI Framework
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP Client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **Cheerio** - Web Scraping
- **Natural** - Text Processing
- **Axios** - HTTP Client

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone 
   cd newsaura
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd src
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

3. **Start the development servers**
   ```bash
   # Start backend server (from /server directory)
   npm start

   # Start frontend development server (from /src directory)
   npm run dev
   ```

4. **Open your browser**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3000](http://localhost:3000)

## 🌟 Usage

1. **Browse News**
   - Visit the homepage to see trending news
   - Use the navigation bar to filter news by category
   - Scroll through the responsive article grid

2. **Read Summaries**
   - Click "Summarize" on any article to view AI-generated summary
   - Access original articles via "Read More"

3. **Mobile Experience**
   - Fully responsive design
   - Touch-friendly interface
   - Mobile-optimized reading experience

## 🎨 Key Components

- **Article Cards**: Modern, interactive cards displaying news previews
- **Smart Navbar**: Category-based navigation with mobile responsiveness
- **Summary Generator**: AI-powered content summarization
- **Content Extractor**: Intelligent article content extraction
- **Category Filters**: Easy news filtering by topics

## 🔧 Configuration

Create a `.env` file in the server directory:

```env
PORT=3000
NODE_ENV=development
# Add any API keys or secrets here
```

## 📈 Performance Optimizations

- Efficient content caching
- Lazy loading of images
- Code splitting
- Optimized build process
- Smart data fetching

## 🔒 Security Features

- Input sanitization
- Rate limiting
- CORS protection
- Error handling
- Secure HTTP headers



## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- News data providers
- Open-source community
- UI/UX inspiration sources
- Contributors and testers




## 🚀 Deployment Instructions

### Backend Deployment (Render/Heroku)

1. Create a new account on Render.com or Heroku
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the following:
   - Build Command: `npm install`
   - Start Command: `node server/server.js`
   - Environment Variables:
     ```
     NODE_ENV=production
     PORT=3000
     ```

### Frontend Deployment (Netlify)

1. Create a new account on Netlify
2. Connect your GitHub repository
3. Set the following build settings:
   - Base directory: `src`
   - Build command: `npm run build`
   - Publish directory: `src/dist`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../src
   npm install
   ```
3. Start the development servers:
   ```bash
   # Start backend (from server directory)
   npm start

   # Start frontend (from src directory)
   npm run dev
   ```

## Deployment Steps

1. Push your code to GitHub
2. Deploy the backend:
   - Create a new web service on Render/Heroku
   - Connect your repository
   - Configure environment variables
   - Deploy the service
   - Copy the deployed URL

3. Deploy the frontend:
   - Log in to Netlify
   - Import your repository
   - Configure build settings
   - Set the VITE_API_URL environment variable to your backend URL
   - Deploy the site

4. Test the deployed application

## Environment Variables

### Backend
- `NODE_ENV`: Set to 'production' in production
- `PORT`: Port number (default: 3000)

### Frontend
- `VITE_API_URL`: URL of the backend API

## Monitoring and Maintenance

- Monitor server logs through your hosting platform
- Check API response times and errors
- Monitor resource usage
- Set up alerts for critical errors

---


