import { NoteType } from '../types';

export const systemNoteTypes: NoteType[] = [
  {
    id: 'general',
    name: 'General',
    color: '#6366f1',
    icon: 'FileText',
    description: 'General purpose notes',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'todo',
    name: 'Todo',
    color: '#f59e0b',
    icon: 'CheckSquare',
    description: 'Task and todo lists',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'idea',
    name: 'Idea',
    color: '#10b981',
    icon: 'Lightbulb',
    description: 'Creative ideas and inspiration',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'meeting',
    name: 'Meeting',
    color: '#8b5cf6',
    icon: 'Users',
    description: 'Meeting notes and minutes',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'research',
    name: 'Research',
    color: '#ef4444',
    icon: 'Search',
    description: 'Research notes and findings',
    isSystem: true,
    createdAt: new Date().toISOString(),
  },
];
