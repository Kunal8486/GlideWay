import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ isLoggedIn, handleLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        
        // Clean up event listener
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);
    
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('.side-menu') && 
                !event.target.closest('.hamburger')) {
                closeMenu();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);
    
    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMenuOpen]);
    
    // Define navigation links dynamically based on authentication status
    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/services', label: 'Services' },
        { path: '/contact', label: 'Contact' },
    ];
    
    if (isLoggedIn) {
        navLinks.push({ path: '/dashboard', label: 'Dashboard' });
    } else {
        navLinks.push({ path: '/login', label: 'Login' });
    }
    
    // Determine if a link is active
    const isActive = (path) => window.location.pathname === path;
    
    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <a href="/" className="logo">
                    <img src="/assets/Logo.png" alt="GlideWay Logo" />
                </a>
                
                <nav className="nav-links">
                    <ul>
                        {navLinks.map((link, index) => (
                            <li key={index} className={isActive(link.path) ? 'active' : ''}>
                                <a href={link.path}>
                                    <span>{link.label}</span>
                                </a>
                            </li>
                        ))}
                        {isLoggedIn && (
                            <li className="logout-container">
                                <button className="logout-button" onClick={handleLogout} aria-label="Log out">
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
                
                <button 
                    className="hamburger" 
                    onClick={toggleMenu} 
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle navigation menu"
                >
                    <img src="/assets/hamburger.svg" alt="" />
                </button>
            </div>
            
            {/* Overlay for mobile menu background */}
            {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
            
            {/* Side menu for mobile */}
            <div className={`side-menu ${isMenuOpen ? 'open' : ''}`} aria-hidden={!isMenuOpen}>
                <button className="close-menu" onClick={closeMenu} aria-label="Close menu">
                    <span aria-hidden="true">×</span>
                </button>
                
                <div className="mobile-logo">
                    <img src="/assets/Logo.png" alt="GlideWay Logo" />
                </div>
                
                <ul>
                    {navLinks.map((link, index) => (
                        <li key={index} className={isActive(link.path) ? 'active' : ''}>
                            <a href={link.path} onClick={closeMenu}>
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
                
                {isLoggedIn && (
                    <div className="mobile-logout">
                        <button 
                            className="logout-button" 
                            onClick={() => {
                                handleLogout();
                                closeMenu();
                            }}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;