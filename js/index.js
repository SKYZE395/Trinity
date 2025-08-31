class TypeWriter {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = texts;
    this.typeSpeed = options.typeSpeed || 50;
    this.deleteSpeed = options.deleteSpeed || 30;
    this.pauseTime = options.pauseTime || 3500;
    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.aiWords = ['AI-powered', 'Smart analytics', 'optimize', 'Intelligent insights'];
    this.permanentAIWords = new Set(); // Track words that should stay highlighted forever

    this.init();
  }

  findAIWordPositions(text) {
    let positions = [];
    this.aiWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        positions.push({
          start: match.index,
          end: match.index + word.length,
          word: match[0]
        });
      }
    });
    return positions.sort((a, b) => a.start - b.start);
  }

  highlightTextUpToPosition(text, position) {
    const aiWordPositions = this.findAIWordPositions(text);
    
    let result = '';
    let lastIndex = 0;
    
    aiWordPositions.forEach(wordPos => {
      // Add text before this AI word
      if (wordPos.start > lastIndex && wordPos.start < position) {
        result += text.slice(lastIndex, wordPos.start);
        lastIndex = wordPos.start;
      }
      
      // FIXED: Start highlighting immediately when we reach the AI word start
      if (wordPos.start <= position) { // Changed from < to <=
        const wordEnd = Math.min(wordPos.end, position);
        const visiblePortion = text.slice(wordPos.start, wordEnd);
        
        if (visiblePortion.length > 0) {
          // Mark as permanent as soon as we start typing it
          this.permanentAIWords.add(wordPos.word.toLowerCase());
          result += `<span class="ai-word">${visiblePortion}</span>`;
          lastIndex = wordEnd;
        }
      }
    });
    
    // Add any remaining regular text
    if (lastIndex < position) {
      result += text.slice(lastIndex, position);
    }
    
    // Apply highlighting to previously seen AI words in other parts
    this.permanentAIWords.forEach(word => {
      const regex = new RegExp(`\\b(${word})\\b`, 'gi');
      result = result.replace(regex, (match, p1) => {
        // Don't double-wrap already highlighted words
        if (result.includes(`<span class="ai-word">${match}</span>`)) {
          return match;
        }
        return `<span class="ai-word">${match}</span>`;
      });
    });
    
    return result;
  }

  init() {
    this.type();
  }

  type() {
    const currentText = this.texts[this.currentTextIndex];
    
    if (!this.isDeleting && this.currentCharIndex < currentText.length) {
      this.currentCharIndex++;
      this.element.innerHTML = this.highlightTextUpToPosition(currentText, this.currentCharIndex);
      setTimeout(() => this.type(), this.typeSpeed);

    } else if (!this.isDeleting && this.currentCharIndex === currentText.length) {
      this.isDeleting = true;
      setTimeout(() => this.type(), this.pauseTime);

    } else if (this.isDeleting && this.currentCharIndex > 0) {
      this.currentCharIndex--;
      this.element.innerHTML = this.highlightTextUpToPosition(currentText, this.currentCharIndex);
      setTimeout(() => this.type(), this.deleteSpeed);

    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false;
      this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
      this.element.innerHTML = '';
      setTimeout(() => this.type(), 200);
    }
  }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

// Navbar scroll effect
function initNavbarScrollEffect() {
  const navbar = document.querySelector('.navbar-custom');
  let lastScrollTop = 0;

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
      navbar.style.transform = 'translateY(-10px)';
      navbar.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
    } else {
      navbar.style.transform = 'translateY(0)';
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }, false);
}

// Animation on scroll for sections
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all sections
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
}

// Pricing cards hover effect enhancement
function initPricingCardEffects() {
  const cards = document.querySelectorAll('.pricing-cards-container .card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize typewriter effect
  const typewriterElement = document.getElementById('typewriter-text');
  if (typewriterElement) {
    const texts = [
      'AI-powered task prioritization helps you focus on what matters most.',
      'Smart analytics identify critical deadlines and optimize your workflow.',
      'Intelligent insights transform your productivity and drive success.'
    ];
    
    new TypeWriter(typewriterElement, texts, {
      typeSpeed: 50,
      deleteSpeed: 30,
      pauseTime: 3000
    });
  }

  // Initialize other features
  initSmoothScrolling();
  initNavbarScrollEffect();
  initScrollAnimations();
  initPricingCardEffects();

  // Add loading effect
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('themelogo');
  
  if (themeToggle && icon) {
    // Load saved theme from localStorage
    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
      icon.innerHTML = '☀️';
    }
  
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
    
      if (document.body.classList.contains('dark-mode')) {
        icon.innerHTML = '☀️';
        localStorage.setItem('theme', 'dark');
      } else {
        icon.innerHTML = '🌙';
        localStorage.setItem('theme', 'light');
      }
    });
  }


});