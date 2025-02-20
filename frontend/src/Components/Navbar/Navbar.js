import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ isLoggedIn, handleLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

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
        <header className="navbar">
            <div className="navbar-container">
                <div className="logo">
                    <img src="/assets/Logo.png" alt="GlideWay Logo" />
                </div>
                <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <ul>
                        {navLinks.map((link, index) => (
                            <li key={index} className={isActive(link.path) ? 'active' : ''}>
                                <a href={link.path}>{link.label}</a>
                            </li>
                        ))}
                        {isLoggedIn && (
                            <li>
                                <button className="logout-button" onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
                <button className="hamburger" onClick={toggleMenu}>
                    <img src="/Logo/hamburger.svg" alt="Hamburger Menu" />
                </button>
            </div>

            {/* Side menu for mobile */}
            <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
                <button className="close-menu" onClick={closeMenu}>×</button>
                <ul>
                    {navLinks.map((link, index) => (
                        <li key={index} onClick={closeMenu} className={isActive(link.path) ? 'active' : ''}>
                            <a href={link.path}>{link.label}</a>
                        </li>
                    ))}
                    {isLoggedIn && (
                        <li>
                            <button className="logout-button" onClick={handleLogout}>
                                Logout
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </header>
    );
};

export default Navbar;
