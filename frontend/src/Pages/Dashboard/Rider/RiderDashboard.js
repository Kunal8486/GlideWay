import React, { 
    useState, 
    useEffect, 
    useMemo, 
    useCallback, 
    useRef 
  } from 'react';
  import { 
    Car, Calendar, Users, Home, MapPin, 
    CreditCard, Bell, Settings, UserCircle, 
    Menu, X, Navigation, Leaf, Gauge, TrendingUp,
    ChevronRight, PieChart, Star, Shield, 
    RefreshCw, Share2, Battery, Zap
  } from 'lucide-react';
  import { Link, useLocation, useNavigate } from 'react-router-dom';
  import { motion, AnimatePresence } from 'framer-motion';
  import './RiderDashboard.css';
  
  // Enhanced mock service with more comprehensive data
  const rideService = {
    fetchRideStats: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            totalRides: 24,
            milesTraveled: 345,
            co2Saved: 42,
            efficiency: 82,
            carbonOffset: 56,
            rewardPoints: 320,
            averageRideTime: 22
          });
        }, 500);
      });
    },
    fetchUpcomingRides: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { 
              id: 1, 
              destination: 'Downtown Office', 
              time: '08:30 AM', 
              date: 'Tomorrow',
              status: 'Confirmed'
            },
            { 
              id: 2, 
              destination: 'Weekend Meetup', 
              time: '02:00 PM', 
              date: 'Saturday',
              status: 'Pending'
            }
          ]);
        }, 300);
      });
    }
  };
  
  const RiderDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(location.pathname);
    const [timeOfDay, setTimeOfDay] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isLoading, setIsLoading] = useState(true);
    
    // Enhanced state management
    const [rideStats, setRideStats] = useState({
      totalRides: 0,
      milesTraveled: 0,
      co2Saved: 0,
      efficiency: 0,
      carbonOffset: 0,
      rewardPoints: 0,
      averageRideTime: 0
    });
    const [upcomingRides, setUpcomingRides] = useState([]);
  
    // Refs and state management
    const resizeObserverRef = useRef(null);
    const statsContainerRef = useRef(null);
  
    // Comprehensive data fetching
    useEffect(() => {
      const fetchDashboardData = async () => {
        try {
          setIsLoading(true);
          const [stats, rides] = await Promise.all([
            rideService.fetchRideStats(),
            rideService.fetchUpcomingRides()
          ]);
          setRideStats(stats);
          setUpcomingRides(rides);
        } catch (error) {
          console.error('Dashboard data fetch failed', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchDashboardData();
    }, []);
  
    // More sophisticated time of day and resize handling
    useEffect(() => {
      const determineTimeOfDay = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Morning';
        if (hour >= 12 && hour < 17) return 'Afternoon';
        return 'Evening';
      };
  
      setTimeOfDay(determineTimeOfDay());
  
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    // Enhanced navigation and action items
    const navItems = useMemo(() => [
      { 
        icon: <Car size={24} />, 
        label: 'Book A Ride', 
        path: '/book-a-ride',
        requiresAuth: true
      },
      { 
        icon: <Share2 size={24} />, 
        label: 'Ride Share', 
        path: '/ride-share',
        requiresAuth: true
      },
      { 
        icon: <Users size={24} />, 
        label: 'Community', 
        path: '/community',
        requiresAuth: true
      },
      { 
        icon: <Shield size={24} />, 
        label: 'Safety', 
        path: '/safety',
        requiresAuth: true
      }
    ], []);
  
    const quickActions = useMemo(() => [
      { 
        icon: <PieChart size={20} />, 
        label: 'Analytics',
        onClick: () => navigate('/ride-analytics'),
        badge: rideStats.rewardPoints
      },
      { 
        icon: <Star size={20} />, 
        label: 'Rewards',
        onClick: () => navigate('/rewards'),
        badge: 'New'
      },
      { 
        icon: <Battery size={20} />, 
        label: 'Eco Impact',
        onClick: () => navigate('/eco-impact')
      },
      { 
        icon: <Zap size={20} />, 
        label: 'Quick Help',
        onClick: () => navigate('/support')
      }
    ], [navigate, rideStats.rewardPoints]);
  
    const quickRideOptions = useMemo(() => [
      { 
        icon: <Car size={32} />, 
        label: 'Commute', 
        description: 'Optimized daily routes',
        onClick: () => navigate('/book-a-ride?type=commute')
      },
      { 
        icon: <Users size={32} />, 
        label: 'Carpool', 
        description: 'Sustainable sharing',
        onClick: () => navigate('/ride-pooling')
      },
      { 
        icon: <MapPin size={32} />, 
        label: 'Nearby', 
        description: 'Local ride options',
        onClick: () => navigate('/nearby-rides')
      },
      { 
        icon: <Calendar size={32} />, 
        label: 'Schedule', 
        description: 'Plan future trips',
        onClick: () => navigate('/schedule-ride')
      }
    ], [navigate]);
  
    // Render loading state
    if (isLoading) {
      return (
        <motion.div 
          className="loading-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="loader"
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <Car size={64} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      );
    }
  
    return (
      <motion.div 
        className="rider-dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with Enhanced User Profile */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="user-profile">
              <UserCircle size={48} className="profile-icon" />
              <div className="user-greeting">
                <h2>Good {timeOfDay}, Eco Rider!</h2>
                <p>Your sustainable journey continues today</p>
              </div>
            </div>
            
            {/* Responsive Header Actions */}
            <div className="header-actions">
              {windowWidth > 768 ? (
                quickActions.map((action, index) => (
                  <motion.div 
                    key={index} 
                    className="header-action-item"
                    onClick={action.onClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {action.icon}
                    {action.badge && (
                      <span className="action-badge">
                        {action.badge}
                      </span>
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="mobile-menu-toggle" 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  whileTap={{ scale: 0.9 }}
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              )}
            </div>
          </div>
        </header>
  
        {/* Navigation */}
        <nav className={`rider-navbar ${windowWidth > 768 ? 'desktop-navbar' : 'mobile-navbar'}`}>
          <div className="rd-navbar-container">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`rd-nav-item ${activeTab === item.path ? 'active' : ''}`}
                onClick={() => setActiveTab(item.path)}
              >
                <div className="rd-nav-icon">{item.icon}</div>
                <span className="rd-nav-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
        
        {/* Dashboard Content */}
        <div className="dashboard-content">

    {/* Quick Ride Section */}
          <section className="quick-ride-section">
            <h3>Quick Ride Options</h3>
            <div className="quick-ride-grid">
              {quickRideOptions.map((option, index) => (
                <motion.div 
                  key={index} 
                  className="quick-ride-item"
                  onClick={option.onClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option.icon}
                  <div className="quick-ride-details">
                    <span className="quick-ride-label">{option.label}</span>
                    <p className="quick-ride-description">{option.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
          
    {/* Upcoming Rides Section */}
          <section className="upcoming-rides-section">
            <h3>Upcoming Rides</h3>
            <div className="upcoming-rides-list">
              {upcomingRides.map((ride) => (
                <motion.div 
                  key={ride.id} 
                  className="upcoming-ride-item"
                  whileHover={{ x: 10 }}
                >
                  <div className="ride-details">
                    <h4>{ride.destination}</h4>
                    <p>{ride.date} at {ride.time}</p>
                  </div>
                  <div className={`ride-status ${ride.status.toLowerCase()}`}>
                    {ride.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>



          {/* Ride Stats Section */}
          <section className="ride-stats-section">
            <motion.div 
              ref={statsContainerRef}
              className="stats-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="stats-header">
                <h3>Your Ride Insights</h3>
                <span className="stats-period">This Month</span>
              </div>
              <div className="stats-grid">
                {[
                  { 
                    icon: <Car size={24} />, 
                    label: 'Total Rides', 
                    value: rideStats.totalRides 
                  },
                  { 
                    icon: <Navigation size={24} />, 
                    label: 'Miles Traveled', 
                    value: rideStats.milesTraveled 
                  },
                  { 
                    icon: <Leaf size={24} />, 
                    label: 'CO2 Saved', 
                    value: `${rideStats.co2Saved} kg` 
                  },
                  { 
                    icon: <TrendingUp size={24} />, 
                    label: 'Efficiency', 
                    value: `${rideStats.efficiency}%` 
                  },
                  {
                    //Here I want to use that component  
                    icon:<Star size={24} />,
                    label: 'Reward Points',
                    value: rideStats.rewardPoints                 

                  }
                ].map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="stat-item"
                    whileHover={{ y: -5 }}
                  >
                    <div className="stat-icon">{stat.icon}</div>
                    <div>
                      <h4>{stat.label}</h4>
                      <p>{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
            </motion.div>
          </section>
  
  

        </div>
      </motion.div>
    );
  };
  
  export default RiderDashboard;