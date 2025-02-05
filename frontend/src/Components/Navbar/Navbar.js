import React, { useState } from 'react';
// import { useLocation } from 'react-router-dom'; // Import useLocation from React Router
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    // Conditionally render the "Dashboard" link based on user's sign-in status
    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/services', label: 'Services' },
        { path: '/contact', label: 'Contact' },
    ].filter(Boolean); // Filters out any false values, like if isSignedIn is false

    // Function to determine if the link is active (matches current location)
    const isActive = (path) => {
        // Logic to determine if the link is active (matches current location)
        return window.location.pathname === path;
    };
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
                </ul>
            </div>
        </header>
    );
};

export default Navbar;