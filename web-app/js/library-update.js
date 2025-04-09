/**
 * This script updates the BookshelfManager to display all books in a single row.
 * It's loaded after script.js and modifies the existing BookshelfManager prototype.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure script.js has fully loaded and initialized the BookshelfManager
    setTimeout(() => {
        if (typeof BookshelfManager !== 'undefined') {
            // Override the createLibraryInterface method
            BookshelfManager.prototype.createLibraryInterface = function() {
                // Create container for buttons
                const container = document.createElement('div');
                container.className = 'library-buttons';
                container.style.pointerEvents = "auto";  // ensure interactivity
                
                // Use all books instead of just 4
                const booksToShow = this.books;
                
                // Create buttons for each book
                booksToShow.forEach(book => {
                    const button = document.createElement('div');
                    button.className = 'library-button';
                    button.style.backgroundImage = `url('${book.image}')`;
                    button.addEventListener('click', () => {
                        this.openBook(book);
                    });
                    container.appendChild(button);
                });
                
                return container;
            };
            
            console.log('BookshelfManager updated to show all books in a single row');
        } else {
            console.error('BookshelfManager not found. Update not applied.');
        }
    }, 500);
});
