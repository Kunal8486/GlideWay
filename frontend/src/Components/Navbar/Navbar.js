import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/services', label: 'Services' },
        { path: '/contact', label: 'Contact' },
    ];

    return (
        <header className="navbar">
            <div className="navbar-container">
                <div className="logo">
                    <a href="/">
                        <img src="/assets/Logo.png" alt="GlideWay Logo" />
                    </a>
                </div>
                <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <ul>
                        {navLinks.map((link, index) => (
                            <li key={index} onClick={closeMenu}>
                                <a href={link.path}>{link.label}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <button className="hamburger" onClick={toggleMenu}>
                    <span className="line"></span>
                    <span className="line"></span>
                    <span className="line"></span>
                </button>
            </div>

            {/* Side menu for mobile */}
            <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
                <button className="close-menu" onClick={closeMenu}>×</button>
                <ul>
                    {navLinks.map((link, index) => (
                        <li key={index} onClick={closeMenu}>
                            <a href={link.path}>{link.label}</a>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
};

export default Navbar;
