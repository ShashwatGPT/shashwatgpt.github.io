# Personal Website

A professional, single-page personal website for Data Science and Machine Learning professionals. Built using a clean, academic-style template suitable for GitHub Pages hosting.

## Features

- **Single-page design** with clean, academic layout
- **Blog section** that auto-syncs with your Medium feed (`@shashwat.gpt`)
- **Projects section** to showcase your work
- **CV section** with a placeholder link you can replace anytime
- **News section** for updates and announcements
- **Professional design** based on academic website templates

## Project Structure

```
.
├── index.html              # Main homepage
├── blog.html               # Blog landing page (mirrors Medium feed)
├── stylesheet.css          # Main stylesheet (Lato font, clean design)
├── script.js               # JavaScript (navigation + Medium feed loading)
├── images/                 # Images directory
│   └── prof_pic.png        # Your profile picture
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

4. **Medium Links**: If you ever change your Medium publication URL, update the constants near the top of `script.js`.
5. **CV placeholder**: Update the link in the `#cv` section of `index.html` when your actual PDF is ready.

### 2. Medium Blog Feed

The blog preview on the homepage (and `blog.html`) pulls posts directly from the Medium RSS feed via the public `rss2json` proxy. No manual updates are required—whenever a new story is published on Medium, it will automatically appear on the site.

- Medium profile: `https://medium.com/@shashwat.gpt`
- Blog navigation link: `https://medium.com/@shashwat.gpt/index-welcome-to-my-reflections-on-code-and-capital-2ac34c7213d9`
- Feed URL used: `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@shashwat.gpt`

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
