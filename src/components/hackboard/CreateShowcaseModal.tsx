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

const CATEGORIES = [
  { value: 'productivity', label: 'Productivity' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'community', label: 'Community' },
  { value: 'developer-tools', label: 'Developer Tools' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' }
];

interface CreateShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: any) => void;
}

const CreateShowcaseModal: React.FC<CreateShowcaseModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    demoUrl: '',
    repoUrl: '',
    category: 'productivity',
    tags: [] as string[],
    currentTag: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      imageUrl: formData.imageUrl,
      demoUrl: formData.demoUrl,
      repoUrl: formData.repoUrl,
      category: formData.category,
      tags: formData.tags
    });
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      demoUrl: '',
      repoUrl: '',
      category: 'productivity',
      tags: [],
      currentTag: ''
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-[#2a2a3a] text-gray-100 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl text-amber-300">Submit Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share your hackathon project with the community.
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
                placeholder="Project title"
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
                placeholder="Describe your project..."
                required
                rows={5}
                className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50 resize-none"
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
                <Label htmlFor="demoUrl" className="text-gray-300">Demo URL</Label>
                <Input
                  id="demoUrl"
                  name="demoUrl"
                  value={formData.demoUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="repoUrl" className="text-gray-300">Repo URL</Label>
                <Input
                  id="repoUrl"
                  name="repoUrl"
                  value={formData.repoUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                  className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50"
                />
              </div>
            </div>
            <div className="space-y-2">
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
                Add relevant tags to help others find your project (e.g., ai, design, react)
              </p>
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

export default CreateShowcaseModal; 