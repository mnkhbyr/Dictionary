import { searchDictionary } from './data/search.js';

// Theme management
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    function setTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', theme);
    }

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme || (prefersDark.matches ? 'dark' : 'light');
    setTheme(initialTheme);

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        setTheme(isDark ? 'light' : 'dark');
    });

    // Watch for system theme changes
    prefersDark.addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const resultsContainer = document.getElementById('dictionary-results');
    const homePage = document.getElementById('home-page');
    const homeLink = document.getElementById('home-link');
    
    // Back to top button
    const backToTopButton = document.getElementById('back-to-top');
    
    // Show/hide back-to-top button
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'flex';
        } else {
            backToTopButton.style.display = 'none';
        }
    });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Home link functionality
    homeLink.addEventListener('click', () => {
        showHomePage();
    });
    
    // Focus search input on page load
    searchInput.focus();
    
    // Search function with debounce
    let searchTimeout;
    const performSearch = () => {
        clearTimeout(searchTimeout);
        
        const query = searchInput.value.trim();
        if (!query) {
            showHomePage();
            return;
        }
        
        // Show loading spinner
        showLoading();
        
        searchTimeout = setTimeout(() => {
            const results = searchDictionary(query);
            
            if (results.length === 0) {
                showNoResults(query);
            } else {
                showResults(results);
            }
            
            // Scroll to results smoothly
            setTimeout(() => {
                resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }, 300);
    };
    
    function showLoading() {
        homePage.style.display = 'none';
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading results...</p>
            </div>
        `;
    }
    
    function showHomePage() {
        homePage.style.display = 'block';
        resultsContainer.style.display = 'none';
        resultsContainer.innerHTML = '';
        searchInput.value = '';
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    function showNoResults(query) {
        homePage.style.display = 'none';
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>"${query}" утгатай илэрц олдсонгүй</p>
                <p>Хайх утгаа ингэж оруулж үзнэ үү: 啊, ā, a, эсвэл аав</p>
            </div>
        `;
    }
    
    function showResults(entries) {
        homePage.style.display = 'none';
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = entries.map((entry, index) => `
            <div class="entry" data-index="${index}">
                <div class="headword">
                    <span class="headword-char">${entry.char}</span>
                    <span class="headword-pinyin">${entry.pinyin}</span>
                    ${entry.pos ? `<span class="part-of-speech">${entry.pos}</span>` : ''}
                </div>
                
                ${entry.definitions.map((def, i) => `
                    <div class="definition-block">
                        <span class="definition-number">${i + 1}</span>
                        <span class="definition-meaning">${def.meaning}</span>
                        
                        ${def.examples ? def.examples.map(ex => `
                            <div class="example" data-chinese="${ex.chinese}" data-mongolian="${ex.mongolian}">
                                <strong>${ex.chinese}</strong> - ${ex.mongolian}
                            </div>
                        `).join('') : ''}
                    </div>
                `).join('')}
            </div>
        `).join('');
        
        // Add click to copy functionality
        document.querySelectorAll('.example').forEach(example => {
            example.addEventListener('click', (e) => {
                const chinese = example.getAttribute('data-chinese');
                const mongolian = example.getAttribute('data-mongolian');
                const textToCopy = `${chinese} - ${mongolian}`;
                
                // Remove existing tooltip
                const existingTooltip = example.querySelector('.copy-tooltip');
                if (existingTooltip) existingTooltip.remove();
                
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Create tooltip
                    const tooltip = document.createElement('div');
                    tooltip.className = 'copy-tooltip';
                    tooltip.textContent = 'Copied!';
                    example.appendChild(tooltip);
                    
                    // Remove tooltip after delay
                    setTimeout(() => {
                        tooltip.style.opacity = '0';
                        setTimeout(() => tooltip.remove(), 200);
                    }, 1500);
                });
            });
        });
    }
    
    // Event listeners
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Initial home page display
    showHomePage();
});