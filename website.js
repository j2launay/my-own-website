// =============================================
// DARK / LIGHT THEME TOGGLE
// =============================================
(function () {
    const saved = localStorage.getItem('theme');
    // Primary check for dark mode
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark-mode');
        // We'll also apply it to the body as soon as it exists
        document.addEventListener('DOMContentLoaded', () => {
            document.body.classList.add('dark-mode');
        });
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    const icon = btn && btn.querySelector('.theme-icon');

    // Sync theme on load
    const isDark = document.documentElement.classList.contains('dark-mode');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';

    if (btn) {
        btn.addEventListener('click', () => {
            const currentlyDark = document.body.classList.toggle('dark-mode');
            document.documentElement.classList.toggle('dark-mode', currentlyDark);
            localStorage.setItem('theme', currentlyDark ? 'dark' : 'light');
            if (icon) icon.textContent = currentlyDark ? '☀️' : '🌙';
        });
    }

    // Highlight active section while scrolling
    const sections = document.querySelectorAll('div[id], section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const handleScroll = () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') && link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init on load

    // Auto-update publications
    const autoPubContainer = document.getElementById('publications-list');
    if (autoPubContainer) {
        loadPublications(autoPubContainer);
    }

    // Contact form AJAX handling
    const contactForm = document.querySelector('form[name="contact"]');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const params = new URLSearchParams(formData);
            params.append('form-name', 'contact');

            // Detect if we are running locally via file:// or localhost
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';

            if (isLocal) {
                console.log('Form data captured (Local Simulation):', Object.fromEntries(formData));
                contactForm.innerHTML = `
                    <div class="form-success">
                        <h3>Success (Local Simulation) ✨</h3>
                        <p>Note: Netlify forms only function on the live site. Locally, we simulate a successful submission.</p>
                        <p>Your message data has been logged to the console.</p>
                        <button onclick="location.reload()" class="btn btn-secondary" style="margin-top: 1rem;">Send another</button>
                    </div>
                `;
                return;
            }

            try {
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: params.toString()
                });
                
                if (response.ok) {
                    contactForm.innerHTML = `
                        <div class="form-success">
                            <h3>Message Sent! 🚀</h3>
                            <p>Thank you for reaching out, Julien will get back to you soon.</p>
                        </div>
                    `;
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                contactForm.innerHTML = `
                    <div class="form-error">
                        <h3>Oops! Submission failed ❌</h3>
                        <p>There was an issue sending your message. Please try emailing directly at: <a href="mailto:juliendelaunay35000@gmail.com">juliendelaunay35000@gmail.com</a></p>
                    </div>
                `;
            }
        });
    }
});

async function loadPublications(container) {
    try {
        // Try local function first
        const response = await fetch('/.netlify/functions/publications');
        if (!response.ok) throw new Error('Function failed');
        
        const data = await response.json();
        const papers = (data.papers || []).sort((a, b) => (b.year || 0) - (a.year || 0));
        renderPapers(container, papers);
    } catch (error) {
        console.warn('Dynamic publications failed, falling back to static list.', error);
        const fallback = [
            { 
              title: "Impact of Explanation Techniques and Representations on Users' Comprehension and Confidence in Explainable AI", 
              year: 2025, venue: "CSCW 2025", url: "https://dl.acm.org/doi/10.1145/3711011" 
            },
            { 
              title: "AILuminate: Introducing v1.0 of the AI Risk and Reliability Benchmark from MLCommons.", 
              year: 2025, venue: "ArXiv", url: "https://arxiv.org/abs/2503.05731" 
            },
            { 
              title: "Evaluating the Effectiveness of Large Language Models in Converting Clinical Data to FHIR Format.", 
              year: 2025, venue: "Applied Sciences MDPI", url: "https://www.mdpi.com/2076-3417/15/6/3379" 
            },
            { 
              title: "Evaluating the Performance of Large Language Models in Predicting Diagnostics for Spanish Clinical Cases in Cardiology.", 
              year: 2024, venue: "Applied Sciences MDPI", url: "https://www.mdpi.com/2076-3417/15/1/61" 
            },
            { 
              title: "Does It Make Sense to Explain a Black Box With Another Black Box?", 
              year: 2024, venue: "Revue TAL", url: "https://arxiv.org/abs/2404.14943" 
            },
            { 
              title: "Explainability for Machine Learning Models: From Data Adaptability to User Perception.", 
              year: 2023, venue: "PhD Thesis (INRIA)", url: "https://theses.hal.science/tel-04462990v1/document" 
            },
            { 
              title: "'Honey, Tell Me What's Wrong', Global Explainability of NLP Models through Cooperative Generation", 
              year: 2023, venue: "TALN 2023", url: "https://coria-taln-2023.sciencesconf.org/461410/document" 
            },
            { 
              title: "S-LIME: Reconciling Locality and Fidelity in Linear Explanations.", 
              year: 2022, venue: "IDA 2022", url: "https://link.springer.com/chapter/10.1007/978-3-031-01333-1_15" 
            },
            { 
              title: "When Should We Use Linear Explanations?", 
              year: 2022, venue: "CIKM 2022", url: "https://dl.acm.org/doi/abs/10.1145/3511808.3557489" 
            },
            { 
              title: "Mine Your Own Business: Mining Intuitive Referring Expressions from Professional Relations.", 
              year: 2021, venue: "BDA 2021", url: "https://hal.science/hal-03363013/" 
            },
            { 
              title: "Improving Anchor-based Explanations.", 
              year: 2020, venue: "CIKM 2020", url: "http://luisgalarraga.de/docs/cikm2020.pdf" 
            }
        ];
        renderPapers(container, fallback);
    }
}

function renderPapers(container, papers) {
    if (!papers || papers.length === 0) {
        container.innerHTML = '<p>No recent publications found.</p>';
        return;
    }

    container.innerHTML = ''; // clear loading text
    
    papers.forEach(paper => {
        const paperDiv = document.createElement('div');
        paperDiv.className = 'auto-pub-item';
        
        const title = document.createElement('strong');
        title.textContent = paper.title;
        
        const details = document.createElement('div');
        details.className = 'auto-pub-details';
        const authors = paper.authors ? paper.authors.map(a => a.name).join(', ') : 'Julien Delaunay';
        const venue = paper.venue ? `, ${paper.venue}` : '';
        const year = paper.year ? ` (${paper.year})` : '';
        details.textContent = `${authors}${venue}${year}`;
        
        paperDiv.appendChild(title);
        paperDiv.appendChild(details);
        
        if (paper.url) {
            const link = document.createElement('a');
            link.href = paper.url;
            link.textContent = 'View Publication →';
            link.target = '_blank';
            link.style.display = 'inline-block';
            link.style.marginTop = '0.5rem';
            link.style.fontSize = '0.9rem';
            paperDiv.appendChild(link);
        }
        
        container.appendChild(paperDiv);
    });
}
