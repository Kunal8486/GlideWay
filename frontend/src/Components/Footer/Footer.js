import React, { Component } from 'react';
import './Footer.css';
import Locate from './Locate.svg';

class NavBar extends Component {
    handleLocationClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // Do something with latitude and longitude, like storing in state
                    console.log('Current location:', latitude, longitude);
                    // Example: store location in component state
                    this.setState({
                        latitude: latitude,
                        longitude: longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Handle errors here
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            // Handle no support for Geolocation
        }
    };

    render() {
        return (
            <footer className='Footer'>
                <nav className='FooterNavigation'>
                    <div className="Spacer"></div>
                    <div className='LocateButtonWrapper'>
                        <div className="ButtonEnclosure" onClick={this.handleLocationClick}>
                            <img className='LocateIcon' alt='Locate icon of ridea' src={Locate} />
                        </div>
                    </div>
                </nav>
            </footer>
        );
    }
}

export default NavBar;
