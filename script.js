// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offset = 70; // Account for fixed navbar
                    const targetPosition = targetElement.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active nav link
                    navLinks.forEach(nav => nav.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });
    
    // Update active nav link on scroll
    const sections = document.querySelectorAll('.section');
    const observerOptions = {
        root: null,
        rootMargin: '-70px 0px -50% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(nav => {
                    nav.classList.remove('active');
                    if (nav.getAttribute('href') === '#' + id) {
                        nav.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
});

// Load blog posts on homepage preview (top 4)
function loadBlogPreview() {
    const blogPreview = document.getElementById('blog-preview');
    if (!blogPreview || !window.blogPosts) return;

    // Sort posts by date (newest first)
    const sortedPosts = [...window.blogPosts].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    // Show only first 4 posts on homepage
    const postsToShow = sortedPosts.slice(0, 4);

    postsToShow.forEach(post => {
        const date = new Date(post.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const postDiv = document.createElement('div');
        postDiv.className = 'blog-post-item';
        
        if (post.type === 'medium') {
            postDiv.innerHTML = `
                <div>
                    <span class="blog-badge blog-badge-medium">Medium</span>
                    <span class="blog-post-date">${date}</span>
                </div>
                <div class="blog-post-title">
                    <a href="${post.url}" target="_blank" rel="noopener">${post.title}</a>
                </div>
                <div class="blog-post-excerpt">${post.excerpt}</div>
            `;
        } else {
            const postUrl = `blog/${post.slug}.html`;
            postDiv.innerHTML = `
                <div>
                    <span class="blog-badge">Local</span>
                    <span class="blog-post-date">${date}</span>
                </div>
                <div class="blog-post-title">
                    <a href="${postUrl}">${post.title}</a>
                </div>
                <div class="blog-post-excerpt">${post.excerpt}</div>
            `;
        }
        
        blogPreview.appendChild(postDiv);
    });
}

// Load blog posts on blog page (all posts)
function loadBlogList() {
    const blogList = document.getElementById('blog-list');
    if (!blogList || !window.blogPosts) return;

    // Sort posts by date (newest first)
    const sortedPosts = [...window.blogPosts].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    sortedPosts.forEach(post => {
        const date = new Date(post.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const postDiv = document.createElement('div');
        postDiv.className = 'blog-post-item';
        
        if (post.type === 'medium') {
            postDiv.innerHTML = `
                <div>
                    <span class="blog-badge blog-badge-medium">Medium</span>
                    <span class="blog-post-date">${date}</span>
                </div>
                <div class="blog-post-title">
                    <a href="${post.url}" target="_blank" rel="noopener">${post.title}</a>
                </div>
                <div class="blog-post-excerpt">${post.excerpt}</div>
            `;
        } else {
            const postUrl = `blog/${post.slug}.html`;
            postDiv.innerHTML = `
                <div>
                    <span class="blog-badge">Local</span>
                    <span class="blog-post-date">${date}</span>
                </div>
                <div class="blog-post-title">
                    <a href="${postUrl}">${post.title}</a>
                </div>
                <div class="blog-post-excerpt">${post.excerpt}</div>
            `;
        }
        
        blogList.appendChild(postDiv);
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('blog-preview')) {
            loadBlogPreview();
        }
        if (document.getElementById('blog-list')) {
            loadBlogList();
        }
    });
} else {
    if (document.getElementById('blog-preview')) {
        loadBlogPreview();
    }
    if (document.getElementById('blog-list')) {
        loadBlogList();
    }
}
