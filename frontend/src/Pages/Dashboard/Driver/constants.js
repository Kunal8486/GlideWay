// import React from "react";
// import { FaCar, FaMoneyBillWave, FaHistory, FaBell, FaPhone } from "react-icons/fa";

// export const dashboardSections = {
//   earnings: {
//     icon: <FaMoneyBillWave />,
//     title: "Earnings",
//     summary: (
//       <div>
//         <p>Today: ₹2,000</p>
//         <p>Weekly: ₹12,500</p>
//         <p>Total: ₹50,000</p>
//       </div>
//     ),
//     details: (
//       <div className="earnings-details">
//         <div className="earnings-summary">
//           <p>Total Earnings: ₹50,000</p>
//           <p>Last 7 Days: ₹12,500</p>
//           <p>Today's Earnings: ₹2,000</p>
//         </div>
//         <div className="earnings-breakdown">
//           <h3>Recent Rides</h3>
//           <ul>
//             <li>Ride #1234 - ₹500 (15:30)</li>
//             <li>Ride #1235 - ₹700 (14:15)</li>
//             <li>Ride #1236 - ₹800 (12:45)</li>
//           </ul>
//         </div>
//       </div>
//     )
//   },
//   history: {
//     icon: <FaHistory />,
//     title: "Ride History",
//     summary: (
//       <div>
//         <p>Completed: 120 Rides</p>
//         <p>Upcoming: 5 Rides</p>
//       </div>
//     ),
//     details: (
//       <div className="history-details">
//         <div className="ride-stats">
//           <p>Completed Rides: 120</p>
//           <p>Upcoming Rides: 5</p>
//           <p>Cancelled Rides: 8</p>
//           <p>Average Rating: 4.8★</p>
//         </div>
//       </div>
//     )
//   },
//   vehicle: {
//     icon: <FaCar />,
//     title: "Vehicle Details",
//     summary: (
//       <div>
//         <p>Toyota Innova</p>
//         <p>XYZ 1234</p>
//       </div>
//     ),
//     details: (
//       <div className="vehicle-details">
//         <p>Car Model: Toyota Innova</p>
//         <p>License Plate: XYZ-1234</p>
//         <p>Insurance: Active (Valid till Dec 2024)</p>
//         <p>Last Service: January 15, 2024</p>
//         <p>Next Service Due: April 15, 2024</p>
//         <p>Vehicle Condition: Excellent</p>
//       </div>
//     )
//   },
//   notifications: {
//     icon: <FaBell />,
//     title: "Notifications",
//     summary: <p>2 New Alerts</p>,
//     details: (
//       <div className="notifications-list">
//         <div className="notification-item">
//           <h4>Vehicle Inspection Due</h4>
//           <p>Your quarterly vehicle inspection is scheduled for next week.</p>
//           <span className="timestamp">2 hours ago</span>
//         </div>
//         <div className="notification-item">
//           <h4>New Feature Available</h4>
//           <p>Try our new route optimization feature for better earnings!</p>
//           <span className="timestamp">1 day ago</span>
//         </div>
//       </div>
//     )
//   },
//   support: {
//     icon: <FaPhone />,
//     title: "Support",
//     summary: <p>24/7 Assistance</p>,
//     details: (
//       <div className="support-details">
//         <p>📞 Emergency: 1800-123-456</p>
//         <p>📧 Email: support@glideway.com</p>
//         <p>💬 Live Chat: Available 24/7</p>
//         <div className="support-options">
//           <h4>Common Issues:</h4>
//           <ul>
//             <li>Technical Support</li>
//             <li>Payment Issues</li>
//             <li>Account Management</li>
//             <li>Vehicle Registration</li>
//           </ul>
//         </div>
//       </div>
//     )
//   }
// };