"use client";
import React from 'react';

interface GhibliArtProps {
  className?: string;
}

export default function GhibliArt({ className = "" }: GhibliArtProps) {
  return (
    <div className={`relative ${className}`}>
      <svg 
        viewBox="0 0 800 600" 
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        {/* Gradient Definitions */}
        <defs>
          {/* Sky gradients */}
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="50%" stopColor="#98D8E8" />
            <stop offset="100%" stopColor="#B8E6F5" />
          </linearGradient>
          
          {/* Mountain gradients */}
          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A6741" />
            <stop offset="100%" stopColor="#6B8E5A" />
          </linearGradient>
          
          {/* Tree gradients */}
          <linearGradient id="treeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#228B22" />
            <stop offset="100%" stopColor="#32CD32" />
          </linearGradient>
          
          {/* Code screen glow */}
          <radialGradient id="screenGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0080FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000080" stopOpacity="0.1" />
          </radialGradient>
          
          {/* Islamic pattern gradient */}
          <linearGradient id="islamicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DAA520" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
          
          {/* Sparkle animation */}
          <circle id="sparkle" r="2" fill="#FFD700" opacity="0.8">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
        </defs>
        
        {/* Sky Background */}
        <rect width="800" height="400" fill="url(#skyGradient)" />
        
        {/* Floating Clouds */}
        <g opacity="0.7">
          <ellipse cx="150" cy="80" rx="60" ry="25" fill="white" opacity="0.8" />
          <ellipse cx="130" cy="75" rx="40" ry="20" fill="white" opacity="0.8" />
          <ellipse cx="170" cy="75" rx="45" ry="22" fill="white" opacity="0.8" />
          
          <ellipse cx="650" cy="120" rx="80" ry="35" fill="white" opacity="0.6" />
          <ellipse cx="620" cy="115" rx="50" ry="25" fill="white" opacity="0.6" />
          <ellipse cx="680" cy="115" rx="55" ry="28" fill="white" opacity="0.6" />
        </g>
        
        {/* Distant Mountains */}
        <path d="M0,250 L200,180 L350,200 L500,160 L650,190 L800,170 L800,400 L0,400 Z" 
              fill="url(#mountainGradient)" opacity="0.6" />
        
        {/* Ancient Tree (Ghibli-style) */}
        <g transform="translate(100, 200)">
          {/* Tree trunk */}
          <path d="M0,200 Q-5,150 0,100 Q5,50 10,0 Q15,50 20,100 Q25,150 20,200 Z" 
                fill="#8B4513" stroke="#654321" strokeWidth="2" />
          
          {/* Tree branches */}
          <path d="M10,50 Q30,40 50,45 Q70,50 90,55" 
                stroke="#8B4513" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M15,80 Q-10,70 -30,75" 
                stroke="#8B4513" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M18,120 Q40,110 65,115" 
                stroke="#8B4513" strokeWidth="7" fill="none" strokeLinecap="round" />
          
          {/* Tree foliage */}
          <circle cx="80" cy="50" r="35" fill="url(#treeGradient)" opacity="0.9" />
          <circle cx="65" cy="45" r="28" fill="url(#treeGradient)" opacity="0.8" />
          <circle cx="95" cy="45" r="25" fill="url(#treeGradient)" opacity="0.8" />
          <circle cx="-25" cy="75" r="30" fill="url(#treeGradient)" opacity="0.9" />
          <circle cx="55" cy="115" r="32" fill="url(#treeGradient)" opacity="0.9" />
          
          {/* Magical sparkles on tree */}
          <use href="#sparkle" x="70" y="40" />
          <use href="#sparkle" x="85" y="60" />
          <use href="#sparkle" x="50" y="110" />
        </g>
        
        {/* Floating Code Elements */}
        <g transform="translate(400, 150)" opacity="0.8">
          {/* Laptop/Screen */}
          <rect x="0" y="0" width="120" height="80" rx="8" fill="#2C3E50" stroke="#34495E" strokeWidth="2" />
          <rect x="8" y="8" width="104" height="64" rx="4" fill="url(#screenGlow)" />
          
          {/* Code lines */}
          <rect x="15" y="18" width="60" height="3" fill="#00FF00" opacity="0.8" />
          <rect x="15" y="25" width="45" height="3" fill="#00FFFF" opacity="0.8" />
          <rect x="15" y="32" width="70" height="3" fill="#FFFF00" opacity="0.8" />
          <rect x="25" y="39" width="55" height="3" fill="#00FF00" opacity="0.8" />
          <rect x="25" y="46" width="40" height="3" fill="#00FFFF" opacity="0.8" />
          <rect x="15" y="53" width="65" height="3" fill="#FF69B4" opacity="0.8" />
          
          {/* Keyboard base */}
          <rect x="5" y="85" width="110" height="25" rx="4" fill="#34495E" />
          
          {/* Floating code symbols */}
          <text x="140" y="30" fill="#00FFFF" fontSize="16" fontFamily="monospace" opacity="0.7">
            &lt;/&gt;
            <animateTransform attributeName="transform" type="translate" 
              values="0,0; 10,-5; 0,0" dur="3s" repeatCount="indefinite" />
          </text>
          <text x="130" y="60" fill="#00FF00" fontSize="14" fontFamily="monospace" opacity="0.7">
            {}
            <animateTransform attributeName="transform" type="translate" 
              values="0,0; -8,3; 0,0" dur="4s" repeatCount="indefinite" />
          </text>
          <text x="150" y="90" fill="#FFFF00" fontSize="12" fontFamily="monospace" opacity="0.7">
            fn()
            <animateTransform attributeName="transform" type="translate" 
              values="0,0; 5,-8; 0,0" dur="2.5s" repeatCount="indefinite" />
          </text>
        </g>
        
        {/* Islamic Geometric Pattern */}
        <g transform="translate(600, 300)" opacity="0.6">
          {/* 8-pointed star pattern */}
          <g fill="url(#islamicGradient)">
            <path d="M0,-20 L7,-7 L20,0 L7,7 L0,20 L-7,7 L-20,0 L-7,-7 Z" />
            <path d="M0,-15 L5,-5 L15,0 L5,5 L0,15 L-5,5 L-15,0 L-5,-5 Z" 
                  fill="none" stroke="#DAA520" strokeWidth="1" />
          </g>
          
          {/* Interlocking circles */}
          <circle cx="-25" cy="-25" r="12" fill="none" stroke="url(#islamicGradient)" strokeWidth="2" />
          <circle cx="25" cy="-25" r="12" fill="none" stroke="url(#islamicGradient)" strokeWidth="2" />
          <circle cx="-25" cy="25" r="12" fill="none" stroke="url(#islamicGradient)" strokeWidth="2" />
          <circle cx="25" cy="25" r="12" fill="none" stroke="url(#islamicGradient)" strokeWidth="2" />
          
          {/* Central calligraphy-inspired design */}
          <path d="M-10,-5 Q0,-10 10,-5 Q0,0 -10,-5 M-10,5 Q0,10 10,5 Q0,0 -10,5" 
                stroke="url(#islamicGradient)" strokeWidth="2" fill="none" />
        </g>
        
        {/* Ground/Grass */}
        <rect x="0" y="400" width="800" height="200" fill="#7CB342" />
        
        {/* Grass blades */}
        <g opacity="0.7">
          {Array.from({length: 20}).map((_, i) => (
            <path 
              key={i}
              d={`M${i * 40 + 20},420 Q${i * 40 + 25},410 ${i * 40 + 30},400`}
              stroke="#4CAF50" 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
            />
          ))}
        </g>
        
        {/* Floating particles/pollen */}
        <g opacity="0.5">
          <circle cx="300" cy="250" r="2" fill="#FFEB3B">
            <animateTransform attributeName="transform" type="translate" 
              values="0,0; 20,-30; 40,-60" dur="8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="8s" repeatCount="indefinite" />
          </circle>
          <circle cx="500" cy="280" r="1.5" fill="#FFC107">
            <animateTransform attributeName="transform" type="translate" 
              values="0,0; -15,-25; -30,-50" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="200" cy="300" r="1" fill="#FF9800">
            <animateTransform attributeName="transform" type="translate" 
              values="0,0; 25,-20; 50,-40" dur="7s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="7s" repeatCount="indefinite" />
          </circle>
        </g>
        
        {/* Birds in the distance */}
        <g transform="translate(550, 100)" opacity="0.4">
          <path d="M0,0 Q5,-3 10,0 Q5,3 0,0" stroke="#2C3E50" strokeWidth="2" fill="none" />
          <path d="M15,5 Q20,2 25,5 Q20,8 15,5" stroke="#2C3E50" strokeWidth="2" fill="none" />
          <path d="M30,-2 Q35,-5 40,-2 Q35,1 30,-2" stroke="#2C3E50" strokeWidth="2" fill="none" />
          <animateTransform attributeName="transform" type="translate" 
            values="550,100; 450,80; 350,60" dur="20s" repeatCount="indefinite" />
        </g>
        
        {/* Elegant inspiration text - responsive for mobile */}
        <g>
          {/* Main heading - thick and very visible */}
          <text x="400" y="500" fill="#1B4332" fontSize="32" fontFamily="serif" fontWeight="900" textAnchor="middle" opacity="1" letterSpacing="1.5px" stroke="#2E5D40" strokeWidth="1">
            "Technology & Nature in Harmony"
          </text>
          
          {/* Arabic text - thick, bold and very visible - larger for mobile */}
          <text x="400" y="535" fill="#0D47A1" fontSize="28" fontFamily="serif" fontWeight="900" textAnchor="middle" opacity="1" stroke="#1565C0" strokeWidth="1.2">
            "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم"
          </text>
          
          {/* English translation - darker and more visible */}
          <text x="400" y="560" fill="#2E1065" fontSize="18" fontFamily="serif" fontWeight="700" textAnchor="middle" opacity="0.95" stroke="#4A148C" strokeWidth="0.5">
            (In the name of Allah, the Most Gracious, the Most Merciful)
          </text>
          
          {/* Simple decorative sparkles */}
          <circle cx="250" cy="495" r="2" fill="#FFD700" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="550" cy="495" r="2" fill="#FFD700" opacity="0.6">
            <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}
