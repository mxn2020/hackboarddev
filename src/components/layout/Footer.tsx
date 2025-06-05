import React from 'react';
import { Zap, Github, Twitter, Linkedin, Discord } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a14] border-t border-[#2a2a3a] py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-6 w-6 text-amber-500" />
              <span className="font-bold text-xl text-white">HackBoard</span>
            </div>
            <p className="text-gray-400 mb-4">
              The community platform for hackathon.dev participants. Connect, collaborate, and create amazing projects.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">
                <Discord className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">Discussion Board</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">Project Showcase</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">Team Matching</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">Resource Sharing</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Hackathon</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">Register</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">Builder Pack</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">Rules & Guidelines</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">Prizes & Judging</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">Starter Templates</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">API Directory</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">Design Resources</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-300 transition-colors">Learning Materials</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#2a2a3a] pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} HackBoard.dev. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-amber-300 text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-500 hover:text-amber-300 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-amber-300 text-sm transition-colors">Code of Conduct</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;