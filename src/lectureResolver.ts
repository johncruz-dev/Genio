export interface Note {
  id: number | string;
  timestamp: number;
  text: string;
}

export interface Lecture {
  name: string;
  notes: Note[];
}

function combineText(localText: string, remoteText: string): string {
  return localText === remoteText ? localText : `${localText} / ${remoteText}`;
}

export function resolveLectures(remote: Lecture, local: Lecture): Lecture {
  const remoteNotesById = new Map(remote.notes.map((note) => [note.id, note]));
  const resolvedNotes: Note[] = [];
  const seenNoteIds = new Set<Note["id"]>();

  for (const localNote of local.notes) {
    const remoteNote = remoteNotesById.get(localNote.id);

    if (!remoteNote) {
      resolvedNotes.push({ ...localNote });
      seenNoteIds.add(localNote.id);
      continue;
    }

    resolvedNotes.push({
      id: localNote.id,
      timestamp: remoteNote.timestamp,
      text: combineText(localNote.text, remoteNote.text)
    });
    seenNoteIds.add(localNote.id);
  }

  for (const remoteNote of remote.notes) {
    if (!seenNoteIds.has(remoteNote.id)) {
      resolvedNotes.push({ ...remoteNote });
    }
  }

  return {
    name: combineText(local.name, remote.name),
    notes: resolvedNotes
  };
}