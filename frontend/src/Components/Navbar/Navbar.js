import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, handleLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    // Use React Router hooks for better navigation management
    const navigate = useNavigate();
    const location = useLocation();
    
    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        
        window.addEventListener('scroll', handleScroll);
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
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMenuOpen]);
    
    // Navigation handler with smooth routing
    const handleNavigation = (path) => {
        navigate(path);
        closeMenu();
    };
    
    // Logout handler with navigation
    const handleLogoutAndRedirect = () => {
        handleLogout();
        navigate('/login'); // Redirect to login page after logout
        closeMenu();
    };
    
    // Define navigation links dynamically based on authentication status
    const getNavLinks = () => {
        const baseLinks = [
            { path: '/', label: 'Home' },
            { path: '/about', label: 'About' },
            { path: '/services', label: 'Services' },
            { path: '/contact', label: 'Contact' },
        ];
        
        if (isLoggedIn) {
            baseLinks.push({ path: '/dashboard', label: 'Dashboard' });
        } else {
            baseLinks.push({ path: '/login', label: 'Login' });
        }
        
        return baseLinks;
    };
    
    // Determine if a link is active using React Router's location
    const isActive = (path) => location.pathname === path;
    
    const navLinks = getNavLinks();
    
    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="logo" onClick={() => handleNavigation('/')}>
                    <img src="/assets/Logo.png" alt="GlideWay Logo" />
                </div>
                
                <nav className="nav-links">
                    <ul>
                        {navLinks.map((link) => (
                            <li 
                                key={link.path} 
                                className={isActive(link.path) ? 'active' : ''}
                            >
                                <button 
                                    onClick={() => handleNavigation(link.path)}
                                    className="nav-link-button"
                                >
                                    {link.label}
                                </button>
                            </li>
                        ))}
                        {isLoggedIn && (
                            <li className="logout-container">
                                <button 
                                    className="logout-button" 
                                    onClick={handleLogoutAndRedirect} 
                                    aria-label="Log out"
                                >
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
                
                <div className="mobile-logo" onClick={() => handleNavigation('/')}>
                    <img src="/assets/Logo.png" alt="GlideWay Logo" />
                </div>
                
                <ul>
                    {navLinks.map((link) => (
                        <li 
                            key={link.path} 
                            className={isActive(link.path) ? 'active' : ''}
                        >
                            <button 
                                onClick={() => handleNavigation(link.path)}
                                className="mobile-nav-link"
                            >
                                {link.label}
                            </button>
                        </li>
                    ))}
                </ul>
                
                {isLoggedIn && (
                    <div className="mobile-logout">
                        <button 
                            className="logout-button" 
                            onClick={handleLogoutAndRedirect}
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