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

const MEDIUM_USERNAME = 'shashwat.gpt';
const MEDIUM_HOME_URL = 'https://medium.com/@shashwat.gpt';
const MEDIUM_WELCOME_URL = 'https://medium.com/@shashwat.gpt/index-welcome-to-my-reflections-on-code-and-capital-2ac34c7213d9';
const MEDIUM_FEED_URL = `https://medium.com/feed/@${MEDIUM_USERNAME}`;
const MEDIUM_RSS_TO_JSON = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(MEDIUM_FEED_URL)}`;

let mediumPostsPromise = null;

function fetchMediumPosts() {
    if (!mediumPostsPromise) {
        mediumPostsPromise = fetch(MEDIUM_RSS_TO_JSON)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Medium feed request failed: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const items = Array.isArray(data.items) ? data.items : [];
                return items.map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    excerpt: getExcerptFromHtml(item.content || item.description || ''),
                    image: item.thumbnail || getImageFromHtml(item.content || ''),
                }));
            })
            .catch(error => {
                console.error('Error fetching Medium posts:', error);
                return [];
            });
    }
    return mediumPostsPromise;
}

function getExcerptFromHtml(html, maxLength = 220) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent || '';
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLength) {
        return cleaned;
    }
    return `${cleaned.slice(0, maxLength).trim()}…`;
}

function getImageFromHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : null;
}

function createMediumPostMarkup(post) {
    const date = new Date(post.pubDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const imageMarkup = post.image ? `
        <div class="blog-post-image">
            <img src="${post.image}" alt="${post.title}">
        </div>
    ` : '';

    return `
        <article class="blog-post-item">
            <div>
                <span class="blog-badge blog-badge-medium">Medium</span>
                <span class="blog-post-date">${date}</span>
            </div>
            <div class="blog-post-title">
                <a href="${post.link}" target="_blank" rel="noopener">${post.title}</a>
            </div>
            ${imageMarkup}
            <div class="blog-post-excerpt">${post.excerpt}</div>
            <a class="blog-read-more" href="${post.link}" target="_blank" rel="noopener">Continue on Medium →</a>
        </article>
    `;
}

function renderMediumPosts(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p class="blog-loading">Loading Medium posts…</p>';

    fetchMediumPosts().then(posts => {
        container.innerHTML = '';

        if (!posts.length) {
            container.innerHTML = `
                <p class="blog-error">
                    Unable to load Medium posts right now. 
                    <a href="${MEDIUM_HOME_URL}" target="_blank" rel="noopener">Visit Medium directly →</a>
                </p>
            `;
            return;
        }

        const postsToRender = limit ? posts.slice(0, limit) : posts;
        postsToRender.forEach(post => {
            container.insertAdjacentHTML('beforeend', createMediumPostMarkup(post));
        });

        if (limit && posts.length > limit) {
            const moreLink = document.createElement('div');
            moreLink.className = 'blog-more';
            moreLink.innerHTML = `
                <a href="${MEDIUM_WELCOME_URL}" target="_blank" rel="noopener" class="view-all-link">
                    View more on Medium →
                </a>
            `;
            container.appendChild(moreLink);
        }
    });
}

function initMediumBlocks() {
    if (document.getElementById('blog-preview')) {
        renderMediumPosts('blog-preview', 4);
    }
    if (document.getElementById('blog-list')) {
        renderMediumPosts('blog-list');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMediumBlocks);
} else {
    initMediumBlocks();
}
