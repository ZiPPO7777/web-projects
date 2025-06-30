// App State
const state = {
    notes: [],
    folders: [],
    currentNote: null,
    currentFolder: null,
    view: 'all', // 'all', 'favorites', 'pinned', 'folder'
    sortBy: 'date-desc',
    searchQuery: '',
    speechSynthesis: null,
    speechUtterance: null,
    isSpeaking: false,
    settings: {
        theme: 'minimal',
        fontFamily: "'Roboto', sans-serif",
        fontSize: 16
    }
};

// DOM Elements
const elements = {
    sidebar: document.getElementById('sidebar'),
    mainContent: document.getElementById('main-content'),
    notesListContainer: document.getElementById('notes-list-container'),
    noteEditorContainer: document.getElementById('note-editor-container'),
    settingsContainer: document.getElementById('settings-container'),
    notesList: document.getElementById('notes-list'),
    notesListTitle: document.getElementById('notes-list-title'),
    noteTitleInput: document.getElementById('note-title-input'),
    noteContent: document.getElementById('note-content'),
    noteDateCreated: document.getElementById('note-date-created'),
    noteWordCount: document.getElementById('note-word-count'),
    foldersList: document.getElementById('folders-list'),
    searchInput: document.getElementById('search-input'),
    sortSelect: document.getElementById('sort-select'),
    pinNoteBtn: document.getElementById('pin-note-btn'),
    favoriteNoteBtn: document.getElementById('favorite-note-btn'),
    speakNoteBtn: document.getElementById('speak-note-btn'),
    exportPdfBtn: document.getElementById('export-pdf-btn'),
    moreActionsBtn: document.getElementById('more-actions-btn'),
    speechControls: document.getElementById('speech-controls'),
    speakPlayBtn: document.getElementById('speak-play-btn'),
    speakPauseBtn: document.getElementById('speak-pause-btn'),
    speakStopBtn: document.getElementById('speak-stop-btn'),
    speechRate: document.getElementById('speech-rate'),
    speechRateValue: document.getElementById('speech-rate-value'),
    speechVoiceSelect: document.getElementById('speech-voice-select'),
    themeSelect: document.getElementById('theme-select'),
    fontSelect: document.getElementById('font-select'),
    fontSize: document.getElementById('font-size'),
    fontSizeValue: document.getElementById('font-size-value'),
    exportAllBtn: document.getElementById('export-all-btn'),
    importNotesBtn: document.getElementById('import-notes-btn'),
    importFileInput: document.getElementById('import-file-input'),
    newFolderBtn: document.getElementById('new-folder-btn'),
    newNoteBtn: document.getElementById('new-note-btn'),
    allNotesBtn: document.getElementById('all-notes-btn'),
    favoritesBtn: document.getElementById('favorites-btn'),
    pinnedBtn: document.getElementById('pinned-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    backToNotesBtn: document.getElementById('back-to-list-btn'),
    backFromSettingsBtn: document.getElementById('back-from-settings-btn'),
    modalOverlay: document.getElementById('modal-overlay'),
    newFolderModal: document.getElementById('new-folder-modal'),
    moveToFolderModal: document.getElementById('move-to-folder-modal'),
    deleteConfirmModal: document.getElementById('delete-confirm-modal'),
    moreActionsModal: document.getElementById('more-actions-modal'),
    newFolderName: document.getElementById('new-folder-name'),
    createFolderBtn: document.getElementById('create-folder-btn'),
    folderSelectList: document.getElementById('folder-select-list'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
    deleteConfirmMessage: document.getElementById('delete-confirm-message'),
    moveNoteBtn: document.getElementById('move-note-btn'),
    duplicateNoteBtn: document.getElementById('duplicate-note-btn'),
    deleteNoteBtn: document.getElementById('delete-note-btn'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    sidebarOverlay: document.getElementById('sidebar-overlay')
};

// Initialize the app
function init() {
    loadData();
    applySettings();
    setupEventListeners();
    renderFolders();
    renderNotesList();
    
    // Check if Speech Synthesis is available
    if ('speechSynthesis' in window) {
        state.speechSynthesis = window.speechSynthesis;
        loadVoices();
        
        // Chrome doesn't always load voices properly, so we need this
        speechSynthesis.onvoiceschanged = loadVoices;
    } else {
        elements.speakNoteBtn.style.display = 'none';
    }
}

// Load data from localStorage
function loadData() {
    const savedNotes = localStorage.getItem('noto-notes');
    const savedFolders = localStorage.getItem('noto-folders');
    const savedSettings = localStorage.getItem('noto-settings');
    
    if (savedNotes) {
        state.notes = JSON.parse(savedNotes);
    }
    
    if (savedFolders) {
        state.folders = JSON.parse(savedFolders);
    }
    
    if (savedSettings) {
        state.settings = JSON.parse(savedSettings);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('noto-notes', JSON.stringify(state.notes));
    localStorage.setItem('noto-folders', JSON.stringify(state.folders));
    localStorage.setItem('noto-settings', JSON.stringify(state.settings));
}

// Apply settings (theme, font, etc.)
function applySettings() {
    // Apply theme
    document.body.setAttribute('data-theme', state.settings.theme);
    elements.themeSelect.value = state.settings.theme;
    
    // Apply font family
    document.body.style.fontFamily = state.settings.fontFamily;
    elements.fontSelect.value = state.settings.fontFamily;
    
    // Apply font size
    document.body.style.fontSize = state.settings.fontSize + 'px';
    elements.fontSize.value = state.settings.fontSize;
    elements.fontSizeValue.textContent = state.settings.fontSize + 'px';
}

// Setup event listeners
function setupEventListeners() {
    // Mobile sidebar toggle
    elements.mobileMenuBtn.addEventListener('click', toggleSidebar);
    elements.sidebarOverlay.addEventListener('click', toggleSidebar);
    
    // Navigation
    elements.newNoteBtn.addEventListener('click', createNewNote);
    elements.allNotesBtn.addEventListener('click', () => showView('all'));
    elements.favoritesBtn.addEventListener('click', () => showView('favorites'));
    elements.pinnedBtn.addEventListener('click', () => showView('pinned'));
    elements.settingsBtn.addEventListener('click', showSettings);
    elements.backToNotesBtn.addEventListener('click', showNotesList);
    elements.backFromSettingsBtn.addEventListener('click', showNotesList);
    
    // Note editor
    elements.noteTitleInput.addEventListener('input', saveCurrentNote);
    elements.noteContent.addEventListener('input', saveCurrentNote);
    
    // Formatting toolbar
    document.querySelectorAll('.btn-format').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const command = btn.getAttribute('data-command');
            applyFormatting(command);
        });
    });
    
    // Note actions
    elements.pinNoteBtn.addEventListener('click', togglePinNote);
    elements.favoriteNoteBtn.addEventListener('click', toggleFavoriteNote);
    elements.speakNoteBtn.addEventListener('click', toggleSpeech);
    elements.exportPdfBtn.addEventListener('click', exportToPdf);
    elements.moreActionsBtn.addEventListener('click', showMoreActionsModal);
    
    // Speech controls
    elements.speakPlayBtn.addEventListener('click', playSpeech);
    elements.speakPauseBtn.addEventListener('click', pauseSpeech);
    elements.speakStopBtn.addEventListener('click', stopSpeech);
    elements.speechRate.addEventListener('input', updateSpeechRate);
    
    // Search and sort
    elements.searchInput.addEventListener('input', handleSearch);
    elements.sortSelect.addEventListener('change', handleSortChange);
    
    // Folders
    elements.newFolderBtn.addEventListener('click', showNewFolderModal);
    elements.createFolderBtn.addEventListener('click', createNewFolder);
    
    // Settings
    elements.themeSelect.addEventListener('change', updateTheme);
    elements.fontSelect.addEventListener('change', updateFont);
    elements.fontSize.addEventListener('input', updateFontSize);
    elements.exportAllBtn.addEventListener('click', exportAllNotes);
    elements.importNotesBtn.addEventListener('click', () => elements.importFileInput.click());
    elements.importFileInput.addEventListener('change', importNotes);
    
    // Modals
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    elements.modalOverlay.addEventListener('click', closeAllModals);
    
    // More actions
    elements.moveNoteBtn.addEventListener('click', showMoveToFolderModal);
    elements.duplicateNoteBtn.addEventListener('click', duplicateCurrentNote);
    elements.deleteNoteBtn.addEventListener('click', confirmDeleteNote);
    elements.confirmDeleteBtn.addEventListener('click', deleteCurrentNote);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Auto-expand textarea
    elements.noteContent.addEventListener('input', autoExpandTextarea);
    
    // Handle back button on Android
    window.addEventListener('popstate', handlePopState);
}

// Toggle sidebar visibility
function toggleSidebar() {
    elements.sidebar.classList.toggle('active');
    elements.sidebarOverlay.classList.toggle('active');
}

// Handle popstate (back button)
function handlePopState() {
    if (elements.noteEditorContainer.classList.contains('hidden')) {
        showNotesList();
    } else {
        showNoteEditor();
    }
}

// Show different views
function showView(view) {
    state.view = view;
    state.currentFolder = null;
    
    // Update active button
    elements.allNotesBtn.classList.remove('active');
    elements.favoritesBtn.classList.remove('active');
    elements.pinnedBtn.classList.remove('active');
    
    switch (view) {
        case 'all':
            elements.allNotesBtn.classList.add('active');
            elements.notesListTitle.textContent = 'All Notes';
            break;
        case 'favorites':
            elements.favoritesBtn.classList.add('active');
            elements.notesListTitle.textContent = 'Favorites';
            break;
        case 'pinned':
            elements.pinnedBtn.classList.add('active');
            elements.notesListTitle.textContent = 'Pinned Notes';
            break;
    }
    
    renderNotesList();
    showNotesList();
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// Show notes list view
function showNotesList() {
    elements.noteEditorContainer.classList.add('hidden');
    elements.settingsContainer.classList.add('hidden');
    elements.notesListContainer.classList.remove('hidden');
    
    // Update URL
    history.pushState({ view: 'list' }, '', '#list');
}

// Show note editor view
function showNoteEditor(noteId) {
    if (noteId) {
        const note = state.notes.find(n => n.id === noteId);
        if (note) {
            state.currentNote = note;
            loadNoteIntoEditor(note);
        }
    }
    
    elements.notesListContainer.classList.add('hidden');
    elements.settingsContainer.classList.add('hidden');
    elements.noteEditorContainer.classList.remove('hidden');
    
    // Update URL
    history.pushState({ view: 'editor' }, '', '#editor');
}

// Show settings view
function showSettings() {
    elements.notesListContainer.classList.add('hidden');
    elements.noteEditorContainer.classList.add('hidden');
    elements.settingsContainer.classList.remove('hidden');
    
    // Update URL
    history.pushState({ view: 'settings' }, '', '#settings');
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// Create a new note
function createNewNote() {
    const newNote = {
        id: Date.now().toString(),
        title: '',
        content: '',
        folderId: state.currentFolder ? state.currentFolder.id : null,
        isFavorite: false,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    state.notes.unshift(newNote);
    state.currentNote = newNote;
    saveData();
    
    loadNoteIntoEditor(newNote);
    renderNotesList();
    showNoteEditor();
    
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// Load note into editor
function loadNoteIntoEditor(note) {
    elements.noteTitleInput.value = note.title;
    elements.noteContent.innerHTML = note.content;
    
    // Update meta info
    const createdDate = new Date(note.createdAt);
    const updatedDate = new Date(note.updatedAt);
    elements.noteDateCreated.textContent = `Created: ${createdDate.toLocaleDateString()} • Updated: ${updatedDate.toLocaleDateString()}`;
    
    // Update word count
    updateWordCount();
    
    // Update pin and favorite buttons
    elements.pinNoteBtn.innerHTML = note.isPinned ? '<span class="material-icons">push_pin</span>' : '<span class="material-icons">push_pin</span>';
    elements.favoriteNoteBtn.innerHTML = note.isFavorite ? '<span class="material-icons">favorite</span>' : '<span class="material-icons">favorite_border</span>';
    
    // Auto-focus content if title is empty, otherwise focus content
    if (note.title === '') {
        elements.noteTitleInput.focus();
    } else {
        elements.noteContent.focus();
    }
}

// Save current note
function saveCurrentNote() {
    if (!state.currentNote) return;
    
    state.currentNote.title = elements.noteTitleInput.value;
    state.currentNote.content = elements.noteContent.innerHTML;
    state.currentNote.updatedAt = new Date().toISOString();
    
    updateWordCount();
    saveData();
    renderNotesList();
}

// Update word count
function updateWordCount() {
    const text = elements.noteContent.textContent || '';
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const charCount = text.length;
    elements.noteWordCount.textContent = `${wordCount} words, ${charCount} chars`;
}

// Auto-expand textarea
function autoExpandTextarea() {
    updateWordCount();
}

// Toggle pin note
function togglePinNote() {
    if (!state.currentNote) return;
    
    state.currentNote.isPinned = !state.currentNote.isPinned;
    elements.pinNoteBtn.innerHTML = state.currentNote.isPinned ? 
        '<span class="material-icons">push_pin</span>' : 
        '<span class="material-icons">push_pin</span>';
    
    saveData();
    renderNotesList();
}

// Toggle favorite note
function toggleFavoriteNote() {
    if (!state.currentNote) return;
    
    state.currentNote.isFavorite = !state.currentNote.isFavorite;
    elements.favoriteNoteBtn.innerHTML = state.currentNote.isFavorite ? 
        '<span class="material-icons">favorite</span>' : 
        '<span class="material-icons">favorite_border</span>';
    
    saveData();
    renderNotesList();
}

// Render folders list
function renderFolders() {
    elements.foldersList.innerHTML = '';
    
    state.folders.forEach(folder => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item' + (state.currentFolder && state.currentFolder.id === folder.id ? ' active' : '');
        folderItem.innerHTML = `
            <span class="material-icons folder-icon">folder</span>
            <span class="folder-name">${folder.name}</span>
            <span class="folder-item-count">(${state.notes.filter(n => n.folderId === folder.id).length})</span>
        `;
        
        folderItem.addEventListener('click', () => {
            state.currentFolder = folder;
            state.view = 'folder';
            elements.notesListTitle.textContent = folder.name;
            
            // Update active states
            document.querySelectorAll('.folder-item').forEach(item => {
                item.classList.remove('active');
            });
            folderItem.classList.add('active');
            elements.allNotesBtn.classList.remove('active');
            elements.favoritesBtn.classList.remove('active');
            elements.pinnedBtn.classList.remove('active');
            
            renderNotesList();
            showNotesList();
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
        
        // Long press to delete folder
        let pressTimer;
        folderItem.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                confirmDeleteFolder(folder);
            }, 1000);
            e.preventDefault();
        });
        
        folderItem.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
        
        folderItem.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
        
        elements.foldersList.appendChild(folderItem);
    });
}

// Render notes list
function renderNotesList() {
    elements.notesList.innerHTML = '';
    
    let filteredNotes = [...state.notes];
    
    // Filter by view
    switch (state.view) {
        case 'favorites':
            filteredNotes = filteredNotes.filter(note => note.isFavorite);
            break;
        case 'pinned':
            filteredNotes = filteredNotes.filter(note => note.isPinned);
            break;
        case 'folder':
            if (state.currentFolder) {
                filteredNotes = filteredNotes.filter(note => note.folderId === state.currentFolder.id);
            }
            break;
    }
    
    // Filter by search query
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filteredNotes = filteredNotes.filter(note => 
            note.title.toLowerCase().includes(query) || 
            note.content.toLowerCase().includes(query)
        );
    }
    
    // Sort notes
    filteredNotes.sort((a, b) => {
        switch (state.sortBy) {
            case 'date-desc':
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            case 'date-asc':
                return new Date(a.updatedAt) - new Date(b.updatedAt);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });
    
    // Group pinned notes at the top
    if (state.view === 'all') {
        const pinnedNotes = filteredNotes.filter(note => note.isPinned);
        const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);
        filteredNotes = [...pinnedNotes, ...unpinnedNotes];
    }
    
    // Render notes
    if (filteredNotes.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = state.searchQuery ? 'No notes match your search' : 'No notes yet';
        elements.notesList.appendChild(emptyMessage);
        return;
    }
    
    filteredNotes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card' + 
            (note.isPinned ? ' pinned' : '') + 
            (note.isFavorite ? ' favorite' : '');
        
        // Create preview content (strip HTML tags and limit length)
        let previewContent = note.content.replace(/<[^>]*>/g, '');
        if (previewContent.length > 100) {
            previewContent = previewContent.substring(0, 100) + '...';
        }
        
        const createdDate = new Date(note.createdAt);
        const updatedDate = new Date(note.updatedAt);
        
        noteCard.innerHTML = `
            <div class="note-card-title">${note.title || 'Untitled Note'}</div>
            <div class="note-card-content">${previewContent || 'No content yet'}</div>
            <div class="note-card-meta">
                <span class="note-card-date">${updatedDate.toLocaleDateString()}</span>
                <span class="note-card-word-count">${countWords(note.content)} words</span>
            </div>
        `;
        
        noteCard.addEventListener('click', () => {
            state.currentNote = note;
            loadNoteIntoEditor(note);
            showNoteEditor();
        });
        
        // Long press to delete
        let pressTimer;
        noteCard.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                confirmDeleteNote(note);
            }, 1000);
            e.preventDefault();
        });
        
        noteCard.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
        
        noteCard.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
        
        elements.notesList.appendChild(noteCard);
    });
}

// Count words in a string
function countWords(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// Handle search
function handleSearch() {
    state.searchQuery = elements.searchInput.value.trim().toLowerCase();
    renderNotesList();
}

// Handle sort change
function handleSortChange() {
    state.sortBy = elements.sortSelect.value;
    renderNotesList();
}

// Show new folder modal
function showNewFolderModal() {
    elements.newFolderName.value = '';
    openModal(elements.newFolderModal);
}

// Create new folder
function createNewFolder() {
    const folderName = elements.newFolderName.value.trim();
    if (!folderName) return;
    
    const newFolder = {
        id: Date.now().toString(),
        name: folderName
    };
    
    state.folders.push(newFolder);
    saveData();
    renderFolders();
    closeAllModals();
}

// Confirm folder deletion
function confirmDeleteFolder(folder) {
    const notesInFolder = state.notes.filter(note => note.folderId === folder.id);
    
    if (notesInFolder.length > 0) {
        elements.deleteConfirmMessage.textContent = `Folder "${folder.name}" contains ${notesInFolder.length} notes. Deleting it will move these notes to "All Notes". Are you sure?`;
    } else {
        elements.deleteConfirmMessage.textContent = `Are you sure you want to delete the folder "${folder.name}"?`;
    }
    
    elements.confirmDeleteBtn.onclick = () => {
        // Move notes to root (no folder)
        state.notes.forEach(note => {
            if (note.folderId === folder.id) {
                note.folderId = null;
            }
        });
        
        // Remove folder
        state.folders = state.folders.filter(f => f.id !== folder.id);
        
        // Reset current folder if it's the one being deleted
        if (state.currentFolder && state.currentFolder.id === folder.id) {
            state.currentFolder = null;
            state.view = 'all';
            elements.notesListTitle.textContent = 'All Notes';
        }
        
        saveData();
        renderFolders();
        renderNotesList();
        closeAllModals();
    };
    
    openModal(elements.deleteConfirmModal);
}

// Show move to folder modal
function showMoveToFolderModal() {
    elements.folderSelectList.innerHTML = '';
    
    // Add "No folder" option
    const noFolderItem = document.createElement('div');
    noFolderItem.className = 'folder-select-item';
    noFolderItem.innerHTML = `
        <span class="material-icons">folder_open</span>
        <span>All Notes</span>
    `;
    noFolderItem.addEventListener('click', () => {
        if (state.currentNote) {
            state.currentNote.folderId = null;
            saveData();
            renderNotesList();
            closeAllModals();
        }
    });
    elements.folderSelectList.appendChild(noFolderItem);
    
    // Add all folders
    state.folders.forEach(folder => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-select-item';
        folderItem.innerHTML = `
            <span class="material-icons">folder</span>
            <span>${folder.name}</span>
        `;
        folderItem.addEventListener('click', () => {
            if (state.currentNote) {
                state.currentNote.folderId = folder.id;
                saveData();
                renderNotesList();
                closeAllModals();
            }
        });
        elements.folderSelectList.appendChild(folderItem);
    });
    
    openModal(elements.moveToFolderModal);
}

// Show more actions modal
function showMoreActionsModal() {
    openModal(elements.moreActionsModal);
}

// Confirm note deletion
function confirmDeleteNote(note = null) {
    const noteToDelete = note || state.currentNote;
    if (!noteToDelete) return;
    
    elements.deleteConfirmMessage.textContent = `Are you sure you want to delete the note "${noteToDelete.title || 'Untitled Note'}"?`;
    
    elements.confirmDeleteBtn.onclick = () => {
        state.notes = state.notes.filter(n => n.id !== noteToDelete.id);
        
        if (state.currentNote && state.currentNote.id === noteToDelete.id) {
            state.currentNote = null;
            showNotesList();
        }
        
        saveData();
        renderNotesList();
        closeAllModals();
    };
    
    openModal(elements.deleteConfirmModal);
}

// Delete current note
function deleteCurrentNote() {
    if (!state.currentNote) return;
    
    state.notes = state.notes.filter(n => n.id !== state.currentNote.id);
    state.currentNote = null;
    
    saveData();
    renderNotesList();
    showNotesList();
    closeAllModals();
}

// Duplicate current note
function duplicateCurrentNote() {
    if (!state.currentNote) return;
    
    const newNote = {
        ...state.currentNote,
        id: Date.now().toString(),
        title: state.currentNote.title + ' (Copy)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    state.notes.unshift(newNote);
    state.currentNote = newNote;
    saveData();
    
    loadNoteIntoEditor(newNote);
    renderNotesList();
    closeAllModals();
}

// Open modal
function openModal(modal) {
    elements.modalOverlay.classList.add('active');
    modal.classList.add('active');
}

// Close all modals
function closeAllModals() {
    elements.modalOverlay.classList.remove('active');
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Apply text formatting
function applyFormatting(command) {
    if (!state.currentNote) return;
    
    document.execCommand('styleWithCSS', false, true);
    
    switch (command) {
        case 'bold':
            document.execCommand('bold', false, null);
            break;
        case 'italic':
            document.execCommand('italic', false, null);
            break;
        case 'underline':
            document.execCommand('underline', false, null);
            break;
        case 'strikethrough':
            document.execCommand('strikeThrough', false, null);
            break;
        case 'heading1':
            document.execCommand('formatBlock', false, '<h1>');
            break;
        case 'heading2':
            document.execCommand('formatBlock', false, '<h2>');
            break;
        case 'heading3':
            document.execCommand('formatBlock', false, '<h3>');
            break;
        case 'quote':
            document.execCommand('formatBlock', false, '<blockquote>');
            break;
        case 'ul':
            document.execCommand('insertUnorderedList', false, null);
            break;
        case 'ol':
            document.execCommand('insertOrderedList', false, null);
            break;
        case 'code':
            // For inline code, we wrap selection in a span with code class
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed) {
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                span.className = 'code';
                range.surroundContents(span);
            } else {
                // For code block
                const codeBlock = document.createElement('pre');
                codeBlock.className = 'code-block';
                codeBlock.textContent = '// Your code here';
                document.execCommand('insertHTML', false, codeBlock.outerHTML);
            }
            break;
    }
    
    saveCurrentNote();
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Only handle shortcuts when note content is focused
    if (document.activeElement !== elements.noteContent) return;
    
    // Check for Ctrl key (or Cmd on Mac)
    const ctrlKey = e.ctrlKey || e.metaKey;
    
    if (ctrlKey) {
        switch (e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                applyFormatting('bold');
                break;
            case 'i':
                e.preventDefault();
                applyFormatting('italic');
                break;
            case 'u':
                e.preventDefault();
                applyFormatting('underline');
                break;
        }
    }
}

// Load available voices for speech synthesis
function loadVoices() {
    if (!state.speechSynthesis) return;
    
    const voices = state.speechSynthesis.getVoices();
    elements.speechVoiceSelect.innerHTML = '';
    
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        elements.speechVoiceSelect.appendChild(option);
    });
}

// Toggle speech
function toggleSpeech() {
    if (!state.speechSynthesis || !state.currentNote) return;
    
    if (state.isSpeaking) {
        stopSpeech();
    } else {
        startSpeech();
    }
}

// Start speech
function startSpeech() {
    if (!state.speechSynthesis || !state.currentNote) return;
    
    // Stop any ongoing speech
    state.speechSynthesis.cancel();
    
    // Create a new utterance
    const text = `${state.currentNote.title}. ${state.currentNote.textContent || ''}`;
    state.speechUtterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if selected
    const selectedVoice = elements.speechVoiceSelect.value;
    if (selectedVoice) {
        const voices = state.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === selectedVoice);
        if (voice) {
            state.speechUtterance.voice = voice;
        }
    }
    
    // Set rate
    state.speechUtterance.rate = parseFloat(elements.speechRate.value);
    
    // Event listeners
    state.speechUtterance.onstart = () => {
        state.isSpeaking = true;
        elements.speechControls.classList.remove('hidden');
        elements.speakNoteBtn.innerHTML = '<span class="material-icons">volume_off</span>';
    };
    
    state.speechUtterance.onend = () => {
        state.isSpeaking = false;
        elements.speakNoteBtn.innerHTML = '<span class="material-icons">volume_up</span>';
    };
    
    state.speechUtterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        state.isSpeaking = false;
        elements.speakNoteBtn.innerHTML = '<span class="material-icons">volume_up</span>';
    };
    
    // Speak
    state.speechSynthesis.speak(state.speechUtterance);
}

// Play speech
function playSpeech() {
    if (!state.speechSynthesis || !state.speechUtterance) return;
    state.speechSynthesis.resume();
}

// Pause speech
function pauseSpeech() {
    if (!state.speechSynthesis || !state.speechUtterance) return;
    state.speechSynthesis.pause();
}

// Stop speech
function stopSpeech() {
    if (!state.speechSynthesis) return;
    state.speechSynthesis.cancel();
    state.isSpeaking = false;
    elements.speakNoteBtn.innerHTML = '<span class="material-icons">volume_up</span>';
}

// Update speech rate
function updateSpeechRate() {
    elements.speechRateValue.textContent = elements.speechRate.value + 'x';
    if (state.speechUtterance) {
        state.speechUtterance.rate = parseFloat(elements.speechRate.value);
    }
}

// Export note to PDF
function exportToPdf() {
    if (!state.currentNote) return;
    
    const element = document.createElement('div');
    element.innerHTML = `
        <h1>${state.currentNote.title || 'Untitled Note'}</h1>
        <div class="note-pdf-content">${state.currentNote.content}</div>
        <div class="note-pdf-footer">
            <p>Created: ${new Date(state.currentNote.createdAt).toLocaleString()}</p>
            <p>Updated: ${new Date(state.currentNote.updatedAt).toLocaleString()}</p>
        </div>
    `;
    
    const opt = {
        margin: 10,
        filename: `${state.currentNote.title || 'note'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(element).set(opt).save();
}

// Export all notes as JSON
function exportAllNotes() {
    const data = {
        notes: state.notes,
        folders: state.folders,
        settings: state.settings
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'noto-notes-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import notes from JSON
function importNotes(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (confirm('Importing will overwrite your current notes. Continue?')) {
                if (data.notes) state.notes = data.notes;
                if (data.folders) state.folders = data.folders;
                if (data.settings) state.settings = data.settings;
                
                saveData();
                applySettings();
                renderFolders();
                renderNotesList();
                
                alert('Notes imported successfully!');
            }
        } catch (error) {
            console.error('Error importing notes:', error);
            alert('Error importing notes. Invalid file format.');
        }
    };
    reader.readAsText(file);
    elements.importFileInput.value = '';
}

// Update theme
function updateTheme() {
    state.settings.theme = elements.themeSelect.value;
    document.body.setAttribute('data-theme', state.settings.theme);
    saveData();
}

// Update font
function updateFont() {
    state.settings.fontFamily = elements.fontSelect.value;
    document.body.style.fontFamily = state.settings.fontFamily;
    saveData();
}

// Update font size
function updateFontSize() {
    state.settings.fontSize = elements.fontSize.value;
    document.body.style.fontSize = state.settings.fontSize + 'px';
    elements.fontSizeValue.textContent = state.settings.fontSize + 'px';
    saveData();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);