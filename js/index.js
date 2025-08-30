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

document.addEventListener('DOMContentLoaded', function() {
  
  const typewriterElement = document.getElementById('typewriter-text');
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

});