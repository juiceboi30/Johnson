// Language translation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load translations
    let translations = {};
    let currentLanguage = 'en';
    
    // Load language from localStorage if available
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        document.getElementById('language-select').value = currentLanguage;
    }
    
    // Load translation file
    function loadTranslations(lang) {
        return fetch(`translations/${lang}.json`)
            .then(response => response.json())
            .then(data => {
                translations[lang] = data;
                return data;
            })
            .catch(error => {
                console.error(`Error loading ${lang} translations:`, error);
                // Fallback to English if translation fails
                if (lang !== 'en') {
                    return loadTranslations('en');
                }
                return {};
            });
    }
    
    // Apply translations to the page
    function applyTranslations(lang) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
        
        // Handle placeholders
        const placeholderElements = document.querySelectorAll('[data-i18n-ph]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-ph');
            if (translations[lang] && translations[lang][key]) {
                element.setAttribute('placeholder', translations[lang][key]);
            }
        });
    }
    
    // Initialize translations
    loadTranslations(currentLanguage)
        .then(() => {
            applyTranslations(currentLanguage);
            
            // Also preload other languages
            const languageSelect = document.getElementById('language-select');
            Array.from(languageSelect.options).forEach(option => {
                if (option.value !== currentLanguage) {
                    loadTranslations(option.value);
                }
            });
        });
    
    // Language selector change event
    document.getElementById('language-select').addEventListener('change', function(e) {
        const newLanguage = e.target.value;
        currentLanguage = newLanguage;
        localStorage.setItem('preferredLanguage', newLanguage);
        
        if (translations[newLanguage]) {
            applyTranslations(newLanguage);
        } else {
            loadTranslations(newLanguage)
                .then(() => applyTranslations(newLanguage));
        }
    });
    
    // Comment functionality
    const commentForm = document.querySelector('.comment-form');
    const commentText = document.getElementById('comment-text');
    const commentsDisplay = document.getElementById('comments-display');
    
    // Load comments from localStorage
    function loadComments() {
        const savedComments = localStorage.getItem('websiteComments');
        if (savedComments) {
            commentsDisplay.innerHTML = JSON.parse(savedComments);
        }
    }
    
    // Save comments to localStorage
    function saveComments() {
        localStorage.setItem('websiteComments', JSON.stringify(commentsDisplay.innerHTML));
    }
    
    // Add a new comment
    function addComment(text) {
        if (!text.trim()) return;
        
        const now = new Date();
        const commentDate = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
        
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `
            <div class="comment-author">${translations[currentLanguage]?.anonymous_user || 'Anonymous User'}</div>
            <div class="comment-date">${commentDate}</div>
            <div class="comment-text">${text}</div>
        `;
        
        commentsDisplay.prepend(commentDiv);
        commentText.value = '';
        saveComments();
    }
    
    // Event listener for comment submission
    document.getElementById('submit-comment').addEventListener('click', function() {
        addComment(commentText.value);
    });
    
    // Also allow Enter key to submit (but Shift+Enter for new line)
    commentText.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addComment(commentText.value);
        }
    });
    
    // Load any existing comments
    loadComments();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});