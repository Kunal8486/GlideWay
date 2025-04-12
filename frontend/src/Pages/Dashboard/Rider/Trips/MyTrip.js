import React from 'react';
import PoolingTrips from './Pooling/Dashboard/PoolingTrips';
import MyBookedPool from './Pooling/MyBookedPool';
const MyTrip = () => {
    return (
        <div>
        <div>
            <PoolingTrips />
        </div>
        <div>
                <MyBookedPool />
            </div>
            <div>
                {/* Add any additional content or components here */}
        </div>
        </div>
    );
};

export default MyTrip;