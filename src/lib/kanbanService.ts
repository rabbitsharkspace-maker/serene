import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';

export interface KanbanTask {
  id: string;
  uid: string;
  title: string;
  dueDate: string;
  status: 'todo' | 'done';
  priority: 'red' | 'yellow' | 'green';
  channel?: string;
  url?: string;
  sourceLetter: string;
  createdAt: number;
}

// Save a new set of tasks extracted from an analyzed letter
export async function saveExtractedTasks(
  tasks: { step: string; officialChannel?: string; url?: string }[],
  sourceLetter: string,
  deadlineDate: string | undefined,
  riskLevel: string | undefined
): Promise<KanbanTask[]> {
  const parsedPriority = riskLevel === 'high' ? 'red' : riskLevel === 'medium' ? 'yellow' : 'green';
  
  // Clean / default due date if missing - e.g. 14 days from now in YYYY-MM-DD
  let finalDueDate = deadlineDate || '';
  if (!finalDueDate) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    finalDueDate = futureDate.toISOString().split('T')[0];
  }

  const newTasks: KanbanTask[] = tasks.map((t, idx) => ({
    id: `task-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
    uid: auth.currentUser?.uid || 'guest',
    title: t.step,
    dueDate: finalDueDate,
    status: 'todo',
    priority: parsedPriority,
    channel: t.officialChannel || '',
    url: t.url || '',
    sourceLetter: sourceLetter || '官方信件',
    createdAt: Date.now()
  }));

  // If authenticated, save to Firestore container
  if (auth.currentUser) {
    try {
      const batch = writeBatch(db);
      for (const t of newTasks) {
        const taskDocRef = doc(db, 'kanbanTasks', t.id);
        batch.set(taskDocRef, t);
      }
      await batch.commit();
      console.log('Successfully saved tasks to Firestore.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'kanbanTasks');
    }
  }

  // Always sync to localStorage so that they are loaded in both cases smoothly
  const existingLocalStr = localStorage.getItem('serene_all_kanban_tasks');
  const existingTasks: KanbanTask[] = existingLocalStr ? JSON.parse(existingLocalStr) : [];
  const updatedTasks = [...newTasks, ...existingTasks];
  localStorage.setItem('serene_all_kanban_tasks', JSON.stringify(updatedTasks));

  return newTasks;
}

// Load all Kanban tasks (with Firebase cloud sync)
export async function loadAllTasks(): Promise<KanbanTask[]> {
  if (auth.currentUser) {
    try {
      const q = query(collection(db, 'kanbanTasks'), where('uid', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const fsTasks: KanbanTask[] = [];
      querySnapshot.forEach((docSnap) => {
        fsTasks.push(docSnap.data() as KanbanTask);
      });
      
      // Sort by createdAt descending
      fsTasks.sort((a, b) => b.createdAt - a.createdAt);
      
      // Also sync to localStorage
      localStorage.setItem('serene_all_kanban_tasks', JSON.stringify(fsTasks));
      return fsTasks;
    } catch (error) {
      console.error('Error loading tasks from Firestore, falling back to local storage:', error);
    }
  }

  // Load from local storage fallback
  const localStr = localStorage.getItem('serene_all_kanban_tasks');
  if (localStr) {
    try {
      const parsed: KanbanTask[] = JSON.parse(localStr);
      return parsed.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
      console.error('Failed to parse local kanban tasks:', e);
    }
  }
  return [];
}

// Toggle task completion status
export async function toggleTaskStatus(taskId: string, currentStatus: 'todo' | 'done'): Promise<'todo' | 'done'> {
  const newStatus = currentStatus === 'todo' ? 'done' : 'todo';

  if (auth.currentUser) {
    try {
      const taskDocRef = doc(db, 'kanbanTasks', taskId);
      await updateDoc(taskDocRef, { status: newStatus });
    } catch (error) {
      console.error('Firestore task update failed:', error);
    }
  }

  // Update in localStorage
  const localStr = localStorage.getItem('serene_all_kanban_tasks');
  if (localStr) {
    try {
      const parsed: KanbanTask[] = JSON.parse(localStr);
      const updated = parsed.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
      localStorage.setItem('serene_all_kanban_tasks', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update local task state:', e);
    }
  }

  return newStatus;
}

// Delete a task
export async function deleteTask(taskId: string): Promise<void> {
  if (auth.currentUser) {
    try {
      const taskDocRef = doc(db, 'kanbanTasks', taskId);
      await deleteDoc(taskDocRef);
    } catch (error) {
      console.error('Firestore task delete failed:', error);
    }
  }

  const localStr = localStorage.getItem('serene_all_kanban_tasks');
  if (localStr) {
    try {
      const parsed: KanbanTask[] = JSON.parse(localStr);
      const filtered = parsed.filter(t => t.id !== taskId);
      localStorage.setItem('serene_all_kanban_tasks', JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete local task:', e);
    }
  }
}
