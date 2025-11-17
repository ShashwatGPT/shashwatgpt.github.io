# Personal Website

A professional, single-page personal website for Data Science and Machine Learning professionals. Built using a clean, academic-style template suitable for GitHub Pages hosting.

## Features

- **Single-page design** with clean, academic layout
- **Blog section** supporting both:
  - Local blog posts (written directly on the website)
  - Medium blog embeds (link to your Medium articles)
- **Projects section** to showcase your work
- **News section** for updates and announcements
- **Professional design** based on academic website templates

## Project Structure

```
.
├── index.html              # Main homepage
├── blog.html               # Blog listing page
├── blog-data.js            # Blog posts data (edit this to add posts)
├── stylesheet.css          # Main stylesheet (Lato font, clean design)
├── script.js               # JavaScript for blog loading
├── images/                 # Images directory
│   └── prof_pic.png        # Your profile picture
├── blog/                   # Directory for local blog posts
│   ├── blog-post-template.html  # Template for new blog posts
│   ├── building-production-ml-systems.html
│   └── data-science-workflow-tips.html
└── README.md               # This file
```

## Setup Instructions

### 1. Customize Content

1. **Personal Information**: Edit `index.html` to update:
   - Your name and description
   - Contact links (Email, LinkedIn, GitHub)
   - Projects section
   - News/updates

2. **Profile Picture**: Add your profile picture as `images/prof_pic.png`

3. **Projects**: Update the Projects section in `index.html` with your actual projects

### 2. Add Blog Posts

#### Adding Medium Posts

Edit `blog-data.js` and add a new entry:

```javascript
{
    type: 'medium',
    title: 'Your Blog Post Title',
    excerpt: 'A brief description of your post',
    date: '2025-01-15',  // Format: YYYY-MM-DD
    url: 'https://medium.com/@yourusername/your-post-url'
}
```

#### Adding Local Posts

1. **Add entry to blog-data.js**:
```javascript
{
    type: 'local',
    title: 'Your Blog Post Title',
    excerpt: 'A brief description of your post',
    date: '2025-01-15',
    slug: 'your-blog-post-slug'  // This will be the filename
}
```

2. **Create the blog post file**:
   - Copy `blog/blog-post-template.html`
   - Rename it to `blog/your-blog-post-slug.html`
   - Edit the content with your blog post
   - Update the title and date in the HTML

### 3. Deploy to GitHub Pages

1. **Create a GitHub repository** named `yourusername.github.io` (replace `yourusername` with your GitHub username)

2. **Push your files** to the repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

3. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "main" branch as source
   - Click "Save"

4. **Your website will be live** at `https://yourusername.github.io`

## Customization

### Colors

The website uses a clean color scheme:
- Links: `#1772d0` (blue)
- Hover: `#f09228` (orange)
- Text: Default black/gray

To change colors, edit the CSS in `stylesheet.css`:

```css
a {
  color: #1772d0;  /* Change link color */
}

a:hover {
  color: #f09228;   /* Change hover color */
}
```

### Fonts

The website uses the Lato font from Google Fonts. The font is loaded via `@font-face` in `stylesheet.css`.

## Credits

Template based on academic website designs, inspired by:
- [Samyak Jain's Personal Website](https://github.com/samyakjain0112/samyakjain0112.github.io)
- Credits to https://github.com/EkdeepSLubana

## License

Feel free to use this template for your own personal website!
