import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';
import ChatbotLauncher from '../ChatbotLauncher/ChatbotLauncher';

const Navbar = ({ isLoggedIn, handleLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [userRole, setUserRole] = useState('rider'); // Default to rider role
    const profileDropdownRef = useRef(null);

    // Use React Router hooks for better navigation management
    const navigate = useNavigate();
    const location = useLocation();

    // Get user role from localStorage on component mount
    useEffect(() => {
        if (isLoggedIn) {
            const storedRole = localStorage.getItem("role");
            if (storedRole) {
                setUserRole(storedRole.toLowerCase());
            }
        }
    }, [isLoggedIn]);

    // Token refresh function
    const refreshToken = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                // If no token exists, redirect to login
                handleLogout();
                navigate('/login');
                return false;
            }

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/nav/refresh-token`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true
                }
            );

            // If refresh is successful, update the token
            if (response.data && response.data.token) {
                localStorage.setItem("token", response.data.token);
                return true;
            }
        } catch (error) {
            console.error("Token refresh failed:", error);
            // If refresh fails, logout the user
            handleLogout();
            navigate('/login');
            return false;
        }
    };

    // Token refresh effect (run every 10 minutes)
    useEffect(() => {
        // Only run token refresh if logged in
        if (!isLoggedIn) return;

        // Initial refresh interval
        const refreshInterval = setInterval(() => {
            refreshToken();
        }, 10 * 60 * 1000); // 10 minutes

        // Cleanup interval on component unmount
        return () => clearInterval(refreshInterval);
    }, [isLoggedIn]);

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
    const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);
    const closeProfileDropdown = () => setProfileDropdownOpen(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('.gw-navbar-side-menu') &&
                !event.target.closest('.gw-navbar-hamburger')) {
                closeMenu();
            }
            
            if (profileDropdownOpen && 
                profileDropdownRef.current && 
                !profileDropdownRef.current.contains(event.target) &&
                !event.target.closest('.gw-navbar-profile-icon-button')) {
                closeProfileDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen, profileDropdownOpen]);

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
        closeProfileDropdown();
    };

    // Logout handler with navigation
    const handleLogoutAndRedirect = () => {
        handleLogout();
        navigate('/login'); // Redirect to login page after logout
        closeMenu();
        closeProfileDropdown();
    };

    // Get user info from localStorage
    const getUserInfo = () => {
        try {
            const userDataString = localStorage.getItem("userData");
            if (userDataString) {
                return JSON.parse(userDataString);
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
        return { name: "User", email: "user@example.com" };
    };

    // User info for display
    const userInfo = getUserInfo();

    // Helper to get role-specific path
    const getRolePath = (basePath) => {
        if (userRole === 'driver') {
            return `/driver${basePath}`;
        }
        return basePath;
    };

    // Define navigation links dynamically based on authentication status and role
    const getNavLinks = () => {
        const baseLinks = [
            { path: '/', label: 'Home' },
            { path: '/about', label: 'About' },
            { path: '/services', label: 'Services' },
            { path: '/contact', label: 'Contact' },
        ];

        if (isLoggedIn) {
            const dashboardPath = getRolePath('/dashboard');
            baseLinks.push({ 
                path: dashboardPath, 
                label: userRole === 'driver' ? 'Driver Dashboard' : 'Book Ride' 
            });
        } else {
            baseLinks.push({ path: '/login', label: 'Login' });
        }

        return baseLinks;
    };

    // Determine if a link is active using React Router's location
    const isActive = (path) => location.pathname === path;

    const navLinks = getNavLinks();

    // Get role-specific profile links
    const getProfileLinks = () => {
        if (userRole === 'driver') {
            return [
                { path: '/driver/profile', label: 'My Profile', icon: 'fas fa-user' },
                { path: '/driver/trips', label: 'My Trips', icon: 'fas fa-route' },
                { path: '/driver/earnings', label: 'My Earnings', icon: 'fas fa-dollar-sign' },
                { path: '/driver/vehicle', label: 'My Vehicle', icon: 'fas fa-car' }
            ];
        }
        return [
            { path: '/profile', label: 'My Profile', icon: 'fas fa-user' },
            { path: '/trips', label: 'My Trips', icon: 'fas fa-home' },
            { path: '/payment', label: 'Payment Methods', icon: 'fas fa-credit-card' }
        ];
    };

    const profileLinks = getProfileLinks();

    return (
        <div>
        <header className={`gw-navbar ${scrolled ? 'gw-navbar-scrolled' : ''}`}>
            <div className="gw-navbar-container">
                <div className="gw-navbar-logo" onClick={() => handleNavigation('/')}>
                    <img src="/assets/Logo.png" alt="GlideWay Logo" />
                </div>

                <nav className="gw-navbar-nav-links">
                    <ul>
                        {navLinks.map((link) => (
                            <li
                                key={link.path}
                                className={isActive(link.path) ? 'gw-navbar-active' : ''}
                            >
                                <button
                                    onClick={() => handleNavigation(link.path)}
                                    className="gw-navbar-nav-link-button"
                                >
                                    {link.label}
                                </button>
                            </li>
                        ))}
                        
                        {isLoggedIn && (
                            <li className="gw-navbar-profile-container">
                                <button 
                                    className="gw-navbar-profile-icon-button" 
                                    onClick={toggleProfileDropdown}
                                    aria-label="Open profile menu"
                                    aria-expanded={profileDropdownOpen}
                                >
                                    <i className="fas fa-user"></i>
                                </button>
                                
                                {profileDropdownOpen && (
                                    <div className="gw-navbar-profile-dropdown" ref={profileDropdownRef}>
                                        <div className="gw-navbar-dropdown-header">
                                            <div className="gw-navbar-user-avatar">
                                                <i className="fas fa-user-circle"></i>
                                            </div>
                                            <div className="gw-navbar-user-info">
                                                <div className="gw-navbar-user-name">{userInfo.name}</div>
                                                <div className="gw-navbar-user-email">{userInfo.email}</div>
                                                <div className="gw-navbar-user-role">{userRole === 'driver' ? 'Driver' : 'Rider'}</div>
                                            </div>
                                        </div>
                                        <ul className="gw-navbar-dropdown-menu">
                                            {profileLinks.map((link) => (
                                                <li key={link.path}>
                                                    <button onClick={() => handleNavigation(link.path)}>
                                                        <i className={link.icon}></i>
                                                        {link.label}
                                                    </button>
                                                </li>
                                            ))}
                                            <li className="gw-navbar-dropdown-divider"></li>
                                            <li>
                                                <button onClick={handleLogoutAndRedirect} className="gw-navbar-dropdown-logout">
                                                    <i className="fas fa-sign-out-alt"></i>
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </li>
                        )}
                    </ul>
                </nav>

                <button
                    className="gw-navbar-hamburger"
                    onClick={toggleMenu}
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle navigation menu"
                >
                    <i className="fas fa-bars"></i>
                </button>
            </div>

            {/* Overlay for mobile menu background */}
            {isMenuOpen && <div className="gw-navbar-menu-overlay" onClick={closeMenu}></div>}

            {/* Side menu for mobile */}
            <div className={`gw-navbar-side-menu ${isMenuOpen ? 'gw-navbar-open' : ''}`} aria-hidden={!isMenuOpen}>
                <button className="gw-navbar-close-menu" onClick={closeMenu} aria-label="Close menu">
                    <i className="fas fa-times"></i>
                </button>

                <div className="gw-navbar-mobile-logo" onClick={() => handleNavigation('/')}>
                    <img src="/assets/Logo.png" alt="GlideWay Logo" />
                </div>

                <ul>
                    {navLinks.map((link) => (
                        <li
                            key={link.path}
                            className={isActive(link.path) ? 'gw-navbar-active' : ''}
                        >
                            <button
                                onClick={() => handleNavigation(link.path)}
                                className="gw-navbar-mobile-nav-link"
                            >
                                {link.label}
                            </button>
                        </li>
                    ))}
                    
                    {isLoggedIn && (
                        <>
                            <li className="gw-navbar-mobile-profile-section">
                                <div className="gw-navbar-mobile-profile-header">
                                    <div className="gw-navbar-mobile-user-avatar">
                                        <i className="fas fa-user-circle fa-2x"></i>
                                    </div>
                                    <div className="gw-navbar-mobile-user-info">
                                        <div className="gw-navbar-mobile-user-name">{userInfo.name}</div>
                                        <div className="gw-navbar-mobile-user-email">{userInfo.email}</div>
                                        <div className="gw-navbar-mobile-user-role">{userRole === 'driver' ? 'Driver' : 'Rider'}</div>
                                    </div>
                                </div>
                            </li>
                            {profileLinks.map((link) => (
                                <li key={link.path}>
                                    <button onClick={() => handleNavigation(link.path)} className="gw-navbar-mobile-nav-link">
                                        <i className={link.icon}></i>
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </>
                    )}
                </ul>

                {isLoggedIn && (
                    <div className="gw-navbar-mobile-logout">
                        <button
                            className="gw-navbar-logout-button"
                            onClick={handleLogoutAndRedirect}
                        >
                            <i className="fas fa-sign-out-alt" style={{marginRight: '8px'}}></i>
                            Logout
                        </button>
                    </div>
                )}
            </div>
            
        </header>
        <ChatbotLauncher
                logoSrc="/assets/icons/SqrLogoSmall.png"
                logoWidth={32}
                logoHeight={32}
                companyName="GlideWay"
                initialContext={['Travel Support', 'Booking Assistance']}
            />
        </div>
    );
};

export default Navbar;