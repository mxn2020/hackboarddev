import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';

const RESOURCE_TYPES = [
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'tool', label: 'Tool' },
  { value: 'template', label: 'Template' },
  { value: 'course', label: 'Course' },
  { value: 'book', label: 'Book' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'library', label: 'Library' },
  { value: 'project-idea', label: 'Project Idea' },
];

const CATEGORIES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'design', label: 'Design' },
  { value: 'database', label: 'Database' },
  { value: 'ai', label: 'AI & Machine Learning' },
  { value: 'web3', label: 'Web3 & Blockchain' },
  { value: 'trends', label: 'Trends & News' },
  { value: 'other', label: 'Other' }
];

interface CreateResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resource: any) => void;
  initialType?: string;
}

const CreateResourceModal: React.FC<CreateResourceModalProps> = ({ isOpen, onClose, onSubmit, initialType }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    imageUrl: '',
    type: initialType || 'article',
    category: 'frontend',
    tags: [] as string[],
    currentTag: '',
    isFree: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or initialType changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        type: initialType || 'article',
      }));
    }
  }, [isOpen, initialType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleAddTag = () => {
    if (formData.currentTag.trim() && !formData.tags.includes(formData.currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag.trim()],
        currentTag: ''
      }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSubmit({
      title: formData.title,
      description: formData.description,
      url: formData.url,
      imageUrl: formData.imageUrl,
      type: formData.type,
      category: formData.category,
      tags: formData.tags,
      isFree: formData.isFree
    });
    setFormData({
      title: '',
      description: '',
      url: '',
      imageUrl: '',
      type: 'article',
      category: 'frontend',
      tags: [],
      currentTag: '',
      isFree: true
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-[#2a2a3a] text-gray-100 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl text-amber-300">Submit Resource</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share a valuable resource with the developer community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Resource title"
                required
                className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the resource..."
                required
                rows={4}
                className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url" className="text-gray-300">Resource URL</Label>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://..."
                required
                className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-gray-300">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="type" className="text-gray-300">Type</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-[#2a2a3a] text-gray-200">
                    {RESOURCE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="category" className="text-gray-300">Category</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-[#2a2a3a] text-gray-200">
                    {CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-gray-300">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="currentTag"
                  name="currentTag"
                  value={formData.currentTag}
                  onChange={handleChange}
                  placeholder="Add a tag..."
                  className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <Badge
                      key={tag}
                      className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Add relevant tags to help others find this resource (e.g., ai, design, react)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFree"
                name="isFree"
                checked={formData.isFree}
                onChange={handleChange}
                className="accent-amber-500"
              />
              <Label htmlFor="isFree" className="text-gray-300">Free Resource</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#2a2a3a] text-gray-300 hover:text-amber-300 hover:border-amber-500/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateResourceModal; 