import React from 'react';
import { BarChart3 } from 'lucide-react';

const GithubIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.05c3-.34 6-1.5 6-6.95 0-1.5-.5-2.7-1.3-3.7.1-.3.6-1.7-.1-3.6 0 0-1-.3-3.3 1.2a11.3 11.3 0 0 0-6 0C7 1.4 6 1.7 6 1.7c-.7 1.9-.2 3.3-.1 3.6-.8 1-1.3 2.2-1.3 3.7 0 5.4 3 6.6 6 7.05a4.8 4.8 0 0 0-1 3.05V22"></path>
    <path d="M9 20c-3 1-5-1-5-3"></path>
  </svg>
);

const LinkedinIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

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
          <LinkedinIcon size={20} />
        </a>
        <a href="https://github.com/HuzefaH10/feature-prioritization-tool" target="_blank" rel="noopener noreferrer" className="header-link">
          <GithubIcon size={20} />
        </a>
      </div>
    </header>
  );
}
