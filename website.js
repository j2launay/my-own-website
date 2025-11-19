
/**
 * Recursively converts an HTML node and its children to a Markdown string.
 * @param {Node} node - The HTML node to convert.
 * @returns {string} The Markdown representation of the node.
 */
function convertNodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        // Replace multiple whitespace characters with a single space, but don't trim yet.
        return node.textContent.replace(/\s+/g, ' ');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return ''; // Ignore comments, etc.
    }

    const tagName = node.tagName.toLowerCase();
    let content = '';
    // Process child nodes first
    node.childNodes.forEach(child => {
        content += convertNodeToMarkdown(child);
    });

    // Format based on tag
    switch (tagName) {
        case 'h1': return `# ${content.trim()}\n\n`;
        case 'h2': return `## ${content.trim()}\n\n`;
        case 'h3': return `### ${content.trim()}\n\n`;
        case 'p': return `\n${content.trim()}\n`;
        case 'div':
            // Treat divs as block elements, ensuring newlines separate content.
            const trimmedContent = content.trim();
            return trimmedContent ? `\n${trimmedContent}\n` : '';
        case 'li':
            // Use a hyphen for list items and ensure it's on a new line.
            return `* ${content.trim()}\n`;
        case 'ul':
        case 'ol':
            return `${content.trim()}\n\n`;
        case 'strong':
        case 'b':
            return ` **${content.trim()}** `;
        case 'em':
        case 'i':
            return ` *${content.trim()}* `;
        case 'a':
            const href = node.getAttribute('href') || '';
            // Ensure it's a full URL if it's a relative path
            const absoluteHref = new URL(href, document.baseURI).href;
            return `[${content.trim()}](${absoluteHref})`;
        case 'br':
            return '\n';
        case 'img': return ''; // Ignore images for the summary.
        default:
            return content; // Return content for unhandled tags like 'span'
    }
}

document.getElementById('copy-for-llm').addEventListener('click', () => {
    /**
     * Extracts and converts a specific section of the page to Markdown.
     * @param {string} selector - The CSS selector for the section's container.
     * @returns {string} The Markdown content of the section.
     */
    const getSectionMarkdown = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return '';

        // Clone the element to safely modify it (e.g., remove the title)
        const elementClone = element.cloneNode(true);

        // Sections have an H1 title that we want to replace with our own ## title.
        const titleElement = elementClone.querySelector('h1');
        if (titleElement) {
            titleElement.remove();
        }

        return convertNodeToMarkdown(elementClone).trim();
    };

    // --- Page info extraction ---
    const intro = document.querySelector('.intro');
    const name = intro.querySelector('h1').textContent.trim();
    const title = intro.querySelector('h2').textContent.trim();
    const affiliation = intro.querySelector('h3').textContent.trim();

    // --- Section content extraction ---
    const sections = [
        { title: 'About Me', content: getSectionMarkdown('.presentation') },
        { title: 'Latest News', content: getSectionMarkdown('#social') },
        { title: 'Projects', content: getSectionMarkdown('#projects') },
        { title: 'Publications', content: getSectionMarkdown('#publication') },
        { title: 'Work Experience', content: getSectionMarkdown('#workexperience') },
        { title: 'Teaching', content: getSectionMarkdown('#teaching') },
        { title: 'Contact Information', content: getSectionMarkdown('.adresse') },
        { title: 'Education', content: getSectionMarkdown('.education') },
        { title: 'Technical Skills', content: getSectionMarkdown('.competences') },
        { title: 'Languages', content: getSectionMarkdown('.languages') },
    ];

    // --- Markdown assembly ---
    let markdown = `# ${name}\n## ${title}\n### ${affiliation}\n\n`;

    sections.forEach(sec => {
        if (sec.content) {
            markdown += `## ${sec.title}\n\n${sec.content}\n\n`;
        }
    });

    // Final cleanup: reduce excessive newlines to a maximum of two.
    const finalMarkdown = markdown.replace(/(\s*\n){3,}/g, '\n\n').trim();

    // --- Copy to clipboard and provide feedback ---
    navigator.clipboard.writeText(finalMarkdown).then(() => {
        const button = document.getElementById('copy-for-llm');
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = 'Copy for LLM';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy markdown to clipboard: ', err);
        const button = document.getElementById('copy-for-llm');
        button.textContent = 'Copy failed';
        setTimeout(() => {
            button.textContent = 'Copy for LLM';
        }, 2000);
    });
});
