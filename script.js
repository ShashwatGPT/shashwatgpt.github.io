// Dynamic fetching of blog and publication content has been removed because 
// modern browsers block file:// protocol XHR/fetch requests, preventing the site
// from working locally without a web server.
//
// The content has been statically embedded into the respective HTML files instead:
// - index.html (Latest Thoughts, Publications)
// - publications.html (Publications List)

// The sidebar is identical on every page, so nav links are written as
// "index.html#section". On index.html itself we resolve them back to in-page
// anchors (smooth scroll + scroll-spy); elsewhere they navigate normally.
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const currentPage = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    // Standalone pages are reached from inside a section of index.html, so tell
    // the sidebar which nav item they belong under.
    const PAGE_SECTION = {
        'publications.html': 'research',
        'quant-systems.html': 'projects',
        'boflow.html': 'research',
        'optimacs.html': 'research',
        'flash.html': 'research',
        'exactct.html': 'research',
        'blogs.html': 'blog-preview-section',
        'the-practicing-mind.html': 'blog-preview-section',
        'community.html': 'community',
        'acm_sigchi.html': 'community',
        'bcs.html': 'community',
        'health_predict.html': 'community',
        'taship.html': 'community'
    };

    const setActive = link => {
        navLinks.forEach(nav => nav.classList.remove('active'));
        if (link) link.classList.add('active');
    };

    // Resolve each nav link against the page we are on.
    const inPageLinks = new Map(); // section id -> link
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const [path, hash] = href.split('#');
        const target = (path.split('/').pop() || 'index.html').toLowerCase();
        const samePage = !path || target === currentPage;

        if (samePage && hash) {
            inPageLinks.set(hash, link);
        } else if (samePage && !hash) {
            setActive(link);
        }
    });

    // On a standalone page, highlight the section it lives under.
    const owningSection = PAGE_SECTION[currentPage];
    if (owningSection) {
        const owner = navLinks.find(l => (l.getAttribute('href') || '').endsWith('#' + owningSection));
        setActive(owner);
    }

    // Smooth scroll for links that point at a section of the current page.
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href') || '';
            const [path, hash] = href.split('#');
            const target = (path.split('/').pop() || 'index.html').toLowerCase();
            if (!hash || (path && target !== currentPage)) return;

            const el = document.getElementById(hash);
            if (!el) return;

            e.preventDefault();
            window.scrollTo({ top: Math.max(el.offsetTop - 40, 0), behavior: 'smooth' });
            history.replaceState(null, '', '#' + hash);
            setActive(this);
        });
    });

    // Scroll-spy, only meaningful where the nav points at sections of this page.
    if (inPageLinks.size) {
        const sections = Array.from(document.querySelectorAll('.section[id]'))
            .filter(sec => inPageLinks.has(sec.id));

        let ticking = false;
        const sync = () => {
            ticking = false;
            let current = null;
            sections.forEach(sec => {
                if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
            });
            // Near the bottom, always highlight the last section.
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4 && sections.length) {
                current = sections[sections.length - 1].id;
            }
            if (current) setActive(inPageLinks.get(current));
        };

        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; window.requestAnimationFrame(sync); }
        }, { passive: true });

        sync();
    }
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
