import React from 'react';
import { BarChart3, Linkedin, Github } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <BarChart3 className="header-logo" size={28} strokeWidth={2.5} />
        <div className="header-title">PriorityIQ</div>
      </div>
      <div className="header-right">
        <span>Built by Huzefa Haveliwala</span>
        <a href="https://linkedin.com/in/huzefa-haveliwala" target="_blank" rel="noopener noreferrer" className="header-link">
          <Linkedin size={20} />
        </a>
        <a href="https://github.com/HuzefaH10/feature-prioritization-tool" target="_blank" rel="noopener noreferrer" className="header-link">
          <Github size={20} />
        </a>
      </div>
    </header>
  );
}
