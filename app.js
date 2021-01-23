class App {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.title = '';
        this.text = '';
        this.id = '';

        this.$placeholder = document.querySelector('#placeholder');
        this.$form = document.querySelector('#form'); //we put $ in front so that we know we're working with and HTML element, not with DATA
        this.$notes = document.querySelector('#notes');
        this.$noteTitle = document.querySelector('#note-title');
        this.$noteText = document.querySelector('#note-text');
        this.$formButtons = document.querySelector('#form-buttons');
        this.$formCloseButton = document.querySelector('#form-close-button');
        this.$modal = document.querySelector('.modal');
        this.$modalTitle = document.querySelector('.modal-title');
        this.$modalText = document.querySelector('.modal-text');
        this.$modalCloseButton = document.querySelector('.modal-close-button');
        this.$colorTooltip = document.querySelector('#color-tooltip');

        this.render();
        this.addEventListeners();
    }

    addEventListeners() {
        document.body.addEventListener('click', event => {
            this.handleFormClick(event);
            this.selectNote(event);
            this.openModal(event);
            this.deleteNote(event);
        });

        document.body.addEventListener('mouseover', event => {
            this.openTooltip(event);
        });

        document.body.addEventListener('mouseout', event => {
            // this.closeTooltip(event);
            setTimeout(() => { this.closeTooltip(event) }, 3000);
        });

        this.$colorTooltip.addEventListener('mouseover', function() {
            this.style.display = 'flex';
        });

        this.$colorTooltip.addEventListener('mouseout', function() {
            this.style.display = 'none';
        });

        this.$colorTooltip.addEventListener('click', event => {
            const color = event.target.dataset.color;
            if (color) {
                this.editNoteColor(color);
            }
        })

        this.$form.addEventListener('submit', event => {
            event.preventDefault();
            const title = this.$noteTitle.value;
            const text = this.$noteText.value;
            const hasNote = title || text;
            if (hasNote) {
                //add note
                this.addNote({ title, text });
            }
        });

        this.$formCloseButton.addEventListener('click', event => {
            event.stopPropagation();
            this.closeForm();
        });

        this.$modalCloseButton.addEventListener('click', event => {
            this.closeModal(event);
        });
    }

    handleFormClick(event) {
        const isFormClicked = this.$form.contains(event.target);

        const title = this.$noteTitle.value;
        const text = this.$noteText.value;
        const hasNote = title || text;

        if (isFormClicked) {
            this.openForm();
        } else if (hasNote) {
            this.addNote({ title, text });
        } else {
            this.closeForm();
        }
    }

    openForm() {
        this.$form.classList.add('form-open');
        this.$noteTitle.style.display = 'block';
        this.$formButtons.style.display = 'block';
    }

    closeForm() {
        this.$form.classList.remove('form-open');
        this.$noteTitle.style.display = 'none';
        this.$formButtons.style.display = 'none';
        this.$noteTitle.value = '';
        this.$noteText.value = '';
    }

    openModal(event) {
        if (event.target.matches('.toolbar-delete')) return;

        if (event.target.closest('.note')) {
            this.$modal.classList.toggle('open-modal');
            this.$modalTitle.value = this.title;
            this.$modalText.value = this.text;
        }
    }

    closeModal(event) {
        this.editNote();
        this.$modal.classList.toggle('open-modal');
    }

    openTooltip(event) {
        if (!event.target.matches('.toolbar-color')) return;
        this.id = event.target.dataset.id;
        const noteCoords = event.target.getBoundingClientRect();
        const horizontal = noteCoords.left + window.scrollX;
        const vertical = noteCoords.top - window.scrollY - 300;
        // console.log('notecords.left: ', noteCoords.left);
        // console.log('window.scrollX: ', window.scrollX);
        // console.log({ horizontal });
        this.$colorTooltip.style.transform = `translate(${horizontal}px, ${vertical}px)`;
        this.$colorTooltip.style.display = 'flex';
    }

    closeTooltip(event) {
        if (!event.target.matches('.toolbar-color')) return;
        this.$colorTooltip.style.display = 'none';
    }

    addNote({ title, text }) {
        const newNote = {
            title,
            text,
            color: 'white',
            id: this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 1
        };
        this.notes = [...this.notes, newNote];
        this.render();
        this.closeForm();

    }

    editNote() {
        const title = this.$modalTitle.value;
        const text = this.$modalText.value;
        this.notes = this.notes.map(note =>
            note.id === Number(this.id) ? {...note, title, text } : note
        )
        this.render();
    }

    editNoteColor(color) {
        this.notes = this.notes.map(note =>
            note.id === Number(this.id) ? {...note, color } : note
        )
        this.render();
    }

    selectNote(event) {
        const $selectedNote = event.target.closest('.note');
        if (!$selectedNote) { return; }
        const [$noteTitle, $noteText] = $selectedNote.children;
        this.title = $noteTitle.innerText;
        this.text = $noteText.innerText;
        this.id = $selectedNote.dataset.id;
    }

    deleteNote(event) {
        event.stopPropagation();
        if (!event.target.matches('.toolbar-delete')) return;
        const id = event.target.dataset.id;
        this.notes = this.notes.filter(note => note.id != Number(id));
        this.render();
    }

    render() {
        this.saveNotes();
        this.displayNotes();
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    displayNotes() {
        const hasNotes = this.notes.length > 0;
        this.$placeholder.style.display = hasNotes ? 'none' : 'flex';

        this.$notes.innerHTML = this.notes.map(note => `
            <div style="background: ${note.color};" class="note" data-id="${note.id}">
                <div class="${note.title && 'note-title'}">${note.title}</div>
                <div class="note-text">${note.text}</div>
                <div class="toolbar-container">
                    <div class="toolbar">
                        <img class="toolbar-color" data-id=${note.id} src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjMDAwIj4KICA8cGF0aCBkPSJNMTIgMjJDNi40OSAyMiAyIDE3LjUxIDIgMTJTNi40OSAyIDEyIDJzMTAgNC4wNCAxMCA5YzAgMy4zMS0yLjY5IDYtNiA2aC0xLjc3Yy0uMjggMC0uNS4yMi0uNS41IDAgLjEyLjA1LjIzLjEzLjMzLjQxLjQ3LjY0IDEuMDYuNjQgMS42N0EyLjUgMi41IDAgMCAxIDEyIDIyem0wLTE4Yy00LjQxIDAtOCAzLjU5LTggOHMzLjU5IDggOCA4Yy4yOCAwIC41LS4yMi41LS41YS41NC41NCAwIDAgMC0uMTQtLjM1Yy0uNDEtLjQ2LS42My0xLjA1LS42My0xLjY1YTIuNSAyLjUgMCAwIDEgMi41LTIuNUgxNmMyLjIxIDAgNC0xLjc5IDQtNCAwLTMuODYtMy41OS03LTgtN3oiLz48Y2lyY2xlIGN4PSI2LjUiIGN5PSIxMS41IiByPSIxLjUiLz4KICA8Y2lyY2xlIGN4PSI5LjUiIGN5PSI3LjUiIHI9IjEuNSIvPjxjaXJjbGUgY3g9IjE0LjUiIGN5PSI3LjUiIHI9IjEuNSIvPjxjaXJjbGUgY3g9IjE3LjUiIGN5PSIxMS41IiByPSIxLjUiLz4KPC9zdmc+Cg==">
                        <img class="toolbar-delete" data-id=${note.id} src="https://www.flaticon.com/svg/vstatic/svg/1214/1214428.svg?token=exp=1611427922~hmac=cc185bd9f2efe34ef6f4735981280e2b">
                    </div>                
                </div>
            </div>
        `).join('');
    }
}


new App()