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
import { X, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';

interface CreateTeamRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: any) => void;
}

const CreateTeamRequestModal: React.FC<CreateTeamRequestModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    skills: [] as string[],
    currentSkill: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (formData.currentSkill.trim() && !formData.skills.includes(formData.currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.currentSkill.trim()],
        currentSkill: ''
      }));
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onSubmit({
        description: formData.description,
        skills: formData.skills
      });
      
      // Reset form
      setFormData({
        description: '',
        skills: [],
        currentSkill: ''
      });
      
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-[#2a2a3a] text-gray-100 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl text-amber-300">Create Team Request</DialogTitle>
            <DialogDescription className="text-gray-400">
              Find the perfect team members for your hackathon project.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-gray-300">Your Skills</Label>
              <div className="flex gap-2">
                <Input 
                  id="currentSkill" 
                  name="currentSkill"
                  value={formData.currentSkill}
                  onChange={handleChange}
                  placeholder="Add a skill you have..."
                  className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={handleAddSkill}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map(skill => (
                    <Badge 
                      key={skill}
                      className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1"
                    >
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Add skills you bring to the team (e.g., UI/UX Designer, React Developer)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">What You're Looking For</Label>
              <Textarea 
                id="description" 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the team members you're looking for and your project idea..."
                required
                rows={6}
                className="bg-[#0a0a14] border-[#2a2a3a] text-gray-200 placeholder:text-gray-500 focus:border-amber-500/50 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Be specific about the skills you need and provide a brief description of your project idea.
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
              disabled={isSubmitting || formData.skills.length === 0 || !formData.description.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isSubmitting ? 'Creating...' : 'Create Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamRequestModal;