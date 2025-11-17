// Blog posts data
// Add your blog posts here. For Medium posts, use type: 'medium' and provide the Medium URL
// For local posts, use type: 'local' and create a corresponding HTML file in the blog/ directory

window.blogPosts = [
    // Example Medium post
    {
        type: 'medium',
        title: 'Understanding Transformers in NLP',
        excerpt: 'A deep dive into transformer architectures and their applications in natural language processing.',
        date: '2025-01-15',
        url: 'https://medium.com/@yourusername/understanding-transformers-in-nlp' // Replace with your Medium URL
    },
    // Example local post
    {
        type: 'local',
        title: 'Building Production ML Systems',
        excerpt: 'Best practices for deploying and maintaining machine learning models in production environments.',
        date: '2024-12-20',
        slug: 'building-production-ml-systems' // This should match the filename in blog/ directory
    },
    // Example local post
    {
        type: 'local',
        title: 'Data Science Workflow Tips',
        excerpt: 'Efficient workflows and tools that can help data scientists be more productive.',
        date: '2024-11-10',
        slug: 'data-science-workflow-tips'
    }
];

// Instructions:
// 1. For Medium posts: Add an object with type: 'medium', title, excerpt, date, and url (your Medium article URL)
// 2. For local posts: Add an object with type: 'local', title, excerpt, date, and slug (filename without .html)
//    Then create a corresponding HTML file in the blog/ directory using the blog-post-template.html

