import React from 'react';
import PoolingTrips from './Pooling/Dashboard/PoolingTrips';
import MyBookedPool from './Pooling/MyBookedPool';
import './MyTrip.css'; // Import your CSS file for styling
const MyTrip = () => {
    return (
        <div>
        <div className='trip-container'>
            <PoolingTrips />
        </div>
        <div className='trip-container'>
                <MyBookedPool />
            </div>
            <div>
                {/* Add any additional content or components here */}
        </div>
        </div>
    );
};

export default MyTrip;