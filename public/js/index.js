let noteForm;
let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let editNoteBtn;
let noteList;
let clearBtn
let jsNotes = [];

if (window.location.pathname === '/notes') {
  noteForm = document.querySelector('.note-form');
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  editNoteBtn = document.querySelector('.edit-note');
  newNoteBtn = document.querySelector('.new-note');
  clearBtn = document.querySelector('.clear-btn');
  noteList = document.querySelectorAll('.list-container .list-group');
}

const show = (elem) => {
  elem.style.display = 'inline';
};

const hide = (elem) => {
  elem.style.display = 'none';
};

let activeNote = {};

const getNotes = async () => {
  try {
    console.log('getting notes');
    const response = await fetch('/api/notes/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json(); 
    jsNotes = data;
    console.log(jsNotes);
    return jsNotes;
  } catch (error) {
    console.error('Error:', error);
  }
};


const saveNote = (note) => {
  const fetchOptions = {
    method: note.id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  };

  const endpoint = note.id ? `/api/notes/${note.id}` : '/api/notes';

  console.log(note.id ? 'updating note' : 'saving note');

  return fetch(endpoint, fetchOptions)
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message); 
    })
    .catch((error) => console.error('Error:', error));
};

const deleteNote = (id) =>  {
  return fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

const renderActiveNote = () => {
  if (activeNote.id) {
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
    show(newNoteBtn);
    show(editNoteBtn); 
  } else {
    hide(newNoteBtn);
    hide(editNoteBtn); 
    hide(clearBtn);
    hide(saveNoteBtn);
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

const editActiveNote = () => {
  hide(saveNoteBtn);
  hide(clearBtn);
  hide(newNoteBtn);

  if (activeNote.id) {
    show(editNoteBtn);
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    hide(editNoteBtn);
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = '';
    noteText.value = '';
  }
};

const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
    hide(saveNoteBtn);
    hide(clearBtn);
  })
  .catch((error) => console.error(error));
};

const handleNoteDelete = (e) => {
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

const handleNoteEdit = (e) => {
  const noteId = activeNote.id;
  console.log(noteId);

  const editedNote = {
    id: noteId,
    title: noteTitle.value,
    text: noteText.value,
  };

  saveNote(editedNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
    hide(saveNoteBtn);
    hide(clearBtn);
    hide(editNoteBtn); 
  })
  .catch((error) => console.error(error));
};


const handleNoteView = (e) => {
  e.preventDefault();
  activeNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  renderActiveNote();
};

const handleNewNoteView = (e) => {
    activeNote = {};
    hide(clearBtn);
    renderActiveNote();
};

const handleRenderBtns = () => {
  show(clearBtn);
  if (!noteTitle.value.trim() && !noteText.value.trim()) {
    hide(clearBtn);
  } else if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

const renderNoteList = async (notes) => {
  try {
    let jsonNotes = jsNotes;
    if (window.location.pathname === '/notes') {
      noteList.forEach((el) => (el.innerHTML = ''));
    }

    let noteListItems = [];

    const createLi = (text, delBtn = true) => {
      const liEl = document.createElement('li');
      liEl.classList.add('list-group-item');

      const spanEl = document.createElement('span');
      spanEl.classList.add('list-item-title');
      spanEl.innerText = text;
      spanEl.addEventListener('click', handleNoteView);

      liEl.append(spanEl);

      if (delBtn) {
        const delBtnEl = document.createElement('i');
        delBtnEl.classList.add(
          'fas',
          'fa-trash-alt',
          'float-right',
          'text-danger',
          'delete-note'
        );
        delBtnEl.addEventListener('click', handleNoteDelete);

        liEl.append(delBtnEl);
      }

      return liEl;
    };

    if (jsonNotes.length === 0) {
      noteListItems.push(createLi('No saved Notes', false));
    }

    jsonNotes.forEach((note) => {
      const li = createLi(note.title);
      li.dataset.note = JSON.stringify(note);

      noteListItems.push(li);
    });

    if (window.location.pathname === '/notes') {
      noteListItems.forEach((note) => noteList[0].append(note));
    }
  } catch (error) {
    console.error('Failed to render notes:', error);
  }
};

const getAndRenderNotes = async () => {
  await getNotes(); 
  renderNoteList(); 
}

if (window.location.pathname === '/notes') {
  newNoteBtn.addEventListener('click', handleNewNoteView);
  clearBtn.addEventListener('click', renderActiveNote);
  noteForm.addEventListener('input', handleRenderBtns);
  editNoteBtn.addEventListener('click', () => {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    show(saveNoteBtn); 
    hide(editNoteBtn);
  });
  saveNoteBtn.addEventListener('click', () => {
    if (activeNote.id) {
      handleNoteEdit();
    } else {
      handleNoteSave();
    }
  });
}

document.addEventListener('DOMContentLoaded', getAndRenderNotes);