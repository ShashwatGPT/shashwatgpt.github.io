// Dynamic fetching of blog and publication content has been removed because 
// modern browsers block file:// protocol XHR/fetch requests, preventing the site
// from working locally without a web server.
//
// The content has been statically embedded into the respective HTML files instead:
// - index.html (Latest Thoughts, Publications)
// - publications.html (Publications List)

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
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

    const observer = new IntersectionObserver(function (entries) {
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
                    categories: item.categories || []
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

function renderCategorizedBlogs(posts) {
    const loadingIndicator = document.getElementById('blog-loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'none';

    const aiContainer = document.getElementById('blog-ai');
    const techContainer = document.getElementById('blog-tech');
    const otherContainer = document.getElementById('blog-other');

    const aiSection = document.getElementById('section-ai');
    const techSection = document.getElementById('section-tech');
    const otherSection = document.getElementById('section-other');

    // Clear containers
    if (aiContainer) aiContainer.innerHTML = '';
    if (techContainer) techContainer.innerHTML = '';
    if (otherContainer) otherContainer.innerHTML = '';

    let hasAi = false;
    let hasTech = false;
    let hasOther = false;

    posts.forEach(post => {
        const cats = post.categories.map(c => c.toLowerCase());
        const markup = createMediumPostMarkup(post);

        // AI/ML Keywords
        if (cats.some(c => ['ai', 'artificial-intelligence', 'machine-learning', 'llm', 'deep-learning', 'nlp', 'computer-vision'].includes(c))) {
            if (aiContainer) {
                aiContainer.insertAdjacentHTML('beforeend', markup);
                hasAi = true;
            }
        }
        // Tech/Engineering Keywords
        else if (cats.some(c => ['technology', 'software-engineering', 'programming', 'coding', 'web-development', 'tech'].includes(c))) {
            if (techContainer) {
                techContainer.insertAdjacentHTML('beforeend', markup);
                hasTech = true;
            }
        }
        // Fallback
        else {
            if (otherContainer) {
                otherContainer.insertAdjacentHTML('beforeend', markup);
                hasOther = true;
            }
        }
    });

    // Show/Hide sections based on content
    if (aiSection) aiSection.classList.toggle('hidden', !hasAi);
    if (techSection) techSection.classList.toggle('hidden', !hasTech);
    if (otherSection) otherSection.classList.toggle('hidden', !hasOther);
}

function initMediumBlocks() {
    // Home Page Preview (Limit 3)
    if (document.getElementById('blog-preview')) {
        renderMediumPosts('blog-preview', 3);
    }

    // All Blogs Page (Categorized)
    if (document.getElementById('blog-ai')) {
        fetchMediumPosts().then(posts => {
            renderCategorizedBlogs(posts);
        });
    }
}

function initPublicationToggles() {
    const toggleAbsLinks = document.querySelectorAll('.toggle-abs');
    const toggleBibLinks = document.querySelectorAll('.toggle-bib');

    toggleAbsLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const item = link.closest('.publication-item');
            const abstract = item.querySelector('.publication-abstract');
            if (abstract) abstract.classList.toggle('hidden');
        });
    });

    toggleBibLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const item = link.closest('.publication-item');
            const bibtex = item.querySelector('.publication-bibtex');
            if (bibtex) bibtex.classList.toggle('hidden');
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initMediumBlocks();
        initPublicationToggles();
    });
} else {
    initMediumBlocks();
    initPublicationToggles();
}
