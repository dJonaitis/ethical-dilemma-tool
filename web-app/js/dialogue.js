/*
    Dialogue Module
    Contains the DialogueBox class and associated methods for typing animation,
    modal dialogue creation, and handling user interaction.
*/

class DialogueBox {
    constructor(options = {}) {
        // Default options
        this.options = {
            typingSpeed: 3,         // ms per character
            container: 'body',       // where to append the dialogue box
            position: 'bottom',      // position on screen
            width: '600px',          // width of dialogue box
            height: 'auto',          // height of dialogue box
            modal: false,            // whether to show as modal with blurred background
            ...options               // override with user options
        };
        
        this.dialogueQueue = [];     // Queue of dialogues to display
        this.isTyping = false;       // Flag to track typing state
        this.currentDialogue = null; // Reference to current dialogue
        this.dialogueBox = null;     // The dialogue box element
        this.textElement = null;     // Element where text appears
        this.continueButton = null;  // Continue button element
        
        // Create the DOM elements
        this.createDialogueBox();
        
        // Create overlay for modal mode
        this.overlay = document.createElement('div');
        this.overlay.className = 'dialogue-overlay';
        this.overlay.style.display = 'none';
        document.body.appendChild(this.overlay);
    }
    
    /**
     * Create the dialogue box DOM structure
     */
    createDialogueBox() {
        // Create main container
        this.dialogueBox = document.createElement('div');
        this.dialogueBox.className = 'dialogue-box';
        this.dialogueBox.style.width = this.options.width;
        this.dialogueBox.style.height = this.options.height;
        
        // Create header with optional title and close button
        const header = document.createElement('div');
        header.className = 'dialogue-header';
        
        // Add the title
        const title = document.createElement('div');
        title.className = 'terminal-header';
        title.textContent = 'COMMUNICATION INTERFACE';
        header.appendChild(title);
        
        // Add close button (X)
        const closeButton = document.createElement('button');
        closeButton.className = 'dialogue-close-btn';
        closeButton.innerHTML = '&times;';
        closeButton.title = 'Close';
        closeButton.addEventListener('click', () => this.hide());
        header.appendChild(closeButton);
        
        this.dialogueBox.appendChild(header);
        
        // Create content area
        const content = document.createElement('div');
        content.className = 'dialogue-content';
        this.dialogueBox.appendChild(content);
        
        // Create text element
        this.textElement = document.createElement('div');
        this.textElement.className = 'dialogue-text terminal-text';
        content.appendChild(this.textElement);
        
        // Create button area
        const buttonArea = document.createElement('div');
        buttonArea.className = 'dialogue-buttons';
        this.dialogueBox.appendChild(buttonArea);
        
        // Create continue button
        this.continueButton = document.createElement('button');
        this.continueButton.className = 'dialogue-continue-btn';
        this.continueButton.textContent = 'CLICK TO CONTINUE';
        this.continueButton.style.display = 'none'; // Hide initially
        this.continueButton.addEventListener('click', () => this.handleContinue());
        buttonArea.appendChild(this.continueButton);
        
        // Hide the dialogue box initially
        this.dialogueBox.style.display = 'none';
        
        // Append to container
        document.querySelector(this.options.container).appendChild(this.dialogueBox);
    }
    
    /**
     * Show a dialogue with the given text and options
     * @param {Object} dialogue Dialogue configuration
     */
    show(dialogue) {
        if (this.isTyping) {
            // If currently typing, add to queue
            this.dialogueQueue.push(dialogue);
            return;
        }
        
        // Enable modal mode if specified
        if (dialogue.modal || this.options.modal) {
            this.dialogueBox.classList.add('modal');
            this.overlay.style.display = 'block';
            document.body.classList.add('dialogue-open');
        }
        
        this.currentDialogue = dialogue;
        this.dialogueBox.style.display = 'flex';
        
        // Set the speaker name if provided
        if (dialogue.speaker) {
            const header = this.dialogueBox.querySelector('.dialogue-header .terminal-header');
            header.textContent = dialogue.speaker;
        } else {
            const header = this.dialogueBox.querySelector('.dialogue-header .terminal-header');
            header.textContent = 'COMMUNICATION INTERFACE';
        }
        
        // Start typing animation
        this.typeText(dialogue.text);
    }
    
    /**
     * Type text with animation effect
     * @param {string} text Text to type
     */
    typeText(text) {
        this.isTyping = true;
        this.textElement.textContent = '';
        this.continueButton.style.display = 'none';
        
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                this.textElement.textContent += text.charAt(i);
                i++;
            } else {
                // Typing completed
                clearInterval(typingInterval);
                this.isTyping = false;
                this.continueButton.style.display = 'block';
            }
        }, this.options.typingSpeed);
        
        // Allow skipping the animation with a click
        this.textElement.addEventListener('click', () => {
            if (this.isTyping) {
                clearInterval(typingInterval);
                this.textElement.textContent = text;
                this.isTyping = false;
                this.continueButton.style.display = 'block';
            }
        }, { once: true });
    }
    
    /**
     * Handle continue button click
     */
    handleContinue() {
        // Safety check - if currentDialogue is null, do nothing
        if (!this.currentDialogue) {
            console.warn('DialogueBox: handleContinue called with no active dialogue');
            return;
        }
        
        // Check if there's a next dialogue or action
        if (this.currentDialogue.next) {
            // If next is a string, assume it's the next dialogue text
            if (typeof this.currentDialogue.next === 'string') {
                this.show({
                    text: this.currentDialogue.next,
                    speaker: this.currentDialogue.speaker
                });
            } 
            // If next is a function, call it
            else if (typeof this.currentDialogue.next === 'function') {
                this.hide(); // Hide first, then call next
                this.currentDialogue.next();
            }
            // If next is a dialogue object, show it
            else if (typeof this.currentDialogue.next === 'object') {
                this.show(this.currentDialogue.next);
            }
        } else {
            // No next dialogue, just close
            this.hide();
        }
    }
    
    /**
     * Hide the dialogue box
     */
    hide() {
        this.dialogueBox.style.display = 'none';
        this.overlay.style.display = 'none';
        document.body.classList.remove('dialogue-open');
        this.dialogueBox.classList.remove('modal');
        this.currentDialogue = null;
        
        // Check if there are more dialogues in queue
        if (this.dialogueQueue.length > 0) {
            const nextDialogue = this.dialogueQueue.shift();
            setTimeout(() => {
                this.show(nextDialogue);
            }, 100);
        }
    }
    
    /**
     * Utility method to create a dialogue sequence
     * @param {Array} dialogues Array of dialogue objects
     */
    createSequence(dialogues) {
        if (!Array.isArray(dialogues) || dialogues.length === 0) return;
        
        // Link dialogues together
        for (let i = 0; i < dialogues.length - 1; i++) {
            dialogues[i].next = dialogues[i + 1];
        }
        
        // Show the first dialogue
        this.show(dialogues[0]);
    }
}

// Global instances for dialogue
window.DialogueSystem = new DialogueBox();
window.ModalDialogueSystem = new DialogueBox({ modal: true });
