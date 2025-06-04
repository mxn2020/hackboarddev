import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Note } from '../types';
import { Search, Plus, Grid, List, Calendar, Tag, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cn } from '../utils/cn';

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Get unique categories and tags
  const categories = Array.from(new Set(notes.map(note => note.category).filter(Boolean))) as string[];
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags || [])));

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await api.get(`/notes?${params.toString()}`);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [searchTerm, selectedCategory, selectedTags, sortBy, sortOrder]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Notes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} found
          </p>
        </div>
        <Link to="/notes/new">
          <Button className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-');
            setSortBy(field);
            setSortOrder(order);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
              <SelectItem value="createdAt-desc">Recently Created</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <Button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-2 text-sm flex items-center gap-2',
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              <Grid className="w-4 h-4" />
              Grid
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-2 text-sm flex items-center gap-2 border-l border-gray-200 dark:border-gray-600',
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              )}
            >
              <List className="w-4 h-4" />
              List
            </Button>
          </div>
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by tags:</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes Grid/List */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No notes found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || selectedCategory || selectedTags.length > 0
              ? "Try adjusting your filters or search terms"
              : "Get started by creating your first note"}
          </p>
          <Link to="/notes/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Note
            </Button>
          </Link>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {notes.map((note) => (
            <Link
              key={note.id}
              to={`/notes/${note.id}`}
              className={cn(
                'block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600',
                viewMode === 'list' ? 'p-4' : 'p-6'
              )}
            >
              <div className={cn(
                viewMode === 'list' ? 'flex items-center justify-between' : 'space-y-3'
              )}>
                <div className={cn(viewMode === 'list' ? 'flex-1' : '')}>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
                    {note.title}
                  </h3>

                  {viewMode === 'grid' && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">
                      {note.content.substring(0, 150)}...
                    </p>
                  )}

                  <div className={cn(
                    'flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400',
                    viewMode === 'list' ? 'mt-1' : ''
                  )}>
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(note.updatedAt)}</span>
                    {note.category && (
                      <>
                        <span>•</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {note.category}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.slice(0, viewMode === 'list' ? 3 : 5).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        >
                          <Tag className="w-2 h-2" />
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > (viewMode === 'list' ? 3 : 5) && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{note.tags.length - (viewMode === 'list' ? 3 : 5)} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
