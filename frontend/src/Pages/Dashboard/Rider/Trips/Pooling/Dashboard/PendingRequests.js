import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar,
    faCalendarAlt,
    faUserFriends,
    faTimes
} from '@fortawesome/free-solid-svg-icons';

const PendingRequests = ({
    pendingRequests,
    selectedRide,
    setSelectedRide,
    showRequestModal,
    setShowRequestModal,
    handleRequestAction,
    actionInProgress,
    formatDate
}) => {

    return (
        <>
            <div className="ptf-rides-list">
                {pendingRequests.length > 0 ? (
                    pendingRequests.map(ride => (
                        <div
                            key={ride._id}
                            className="ptf-ride-card ptf-request-card"
                            onClick={() => {
                                setSelectedRide(ride);
                                setShowRequestModal(true);
                            }}
                        >
                            <div className="ptf-ride-header">
                                <h3>
                                    {ride.origin} → {ride.destination}
                                </h3>
                                <span className="ptf-pending-badge">
                                    {ride.passengers.filter(p => p.status === 'pending').length} Pending
                                </span>
                            </div>

                            <div className="ptf-ride-details">
                                <p>
                                    <FontAwesomeIcon icon={faCalendarAlt} /> {formatDate(ride.date)} at {ride.time}
                                </p>
                            </div>

                            <div className="ptf-passenger-requests">
                                {ride.passengers
                                    .filter(passenger => passenger.status === 'pending')
                                    .slice(0, 3)
                                    .map(passenger => (
                                        <div key={passenger.user} className="ptf-passenger-preview">
                                            <img
                                                src={passenger.profile_picture_url || passenger.avatar}
                                                alt={`${passenger.name}'s profile picture`}
                                                className="ptf-passenger-avatar"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png';
                                                }}
                                            />
                                            <span>{passenger.name}</span>
                                        </div>
                                    ))
                                }
                                {ride.passengers.filter(p => p.status === 'pending').length > 3 && (
                                    <span className="ptf-more-passengers">
                                        +{ride.passengers.filter(p => p.status === 'pending').length - 3} more
                                    </span>
                                )}
                            </div>

                            <button className="ptf-view-requests-btn">
                                View Requests
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="ptf-empty-state">
                        <FontAwesomeIcon icon={faUserFriends} size="3x" />
                        <p>No pending ride requests at the moment.</p>
                    </div>
                )}
            </div>

            {showRequestModal && selectedRide && (
                <div className="ptf-modal-overlay">
                    <div className="ptf-request-modal">
                        <button
                            className="ptf-close-modal"
                            onClick={() => setShowRequestModal(false)}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>

                        <h2>Ride Request Approvals</h2>
                        <h3>{selectedRide.origin} → {selectedRide.destination}</h3>
                        <p className="ptf-modal-date">{formatDate(selectedRide.date)} at {selectedRide.time}</p>

                        <div className="ptf-requests-list">
                            {selectedRide.passengers
                                .filter(passenger => passenger.status === 'pending')
                                .map(passenger => (
                                    <div key={passenger.user} className="ptf-request-item">
                                        <div className="ptf-passenger-info">
                                        <img
                                                src={passenger.profile_picture_url || passenger.avatar}
                                                alt={`${passenger.name}'s profile picture`}
                                                className="ptf-passenger-avatar"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png';
                                                }}
                                            />
                                            <div>
                                                <h4>{passenger.name}</h4>
                                                <p>Pickup: {passenger.pickupLocation.address}</p>
                                                <p>Dropoff: {passenger.dropoffLocation.address}</p>
                                            </div>
                                        </div>

                                        <div className="ptf-action-buttons">
                                            <button
                                                className="ptf-approve-btn"
                                                onClick={() => handleRequestAction(
                                                    selectedRide._id,
                                                    passenger.user,
                                                    'accepted'
                                                )}
                                                disabled={actionInProgress === `${passenger.user}-accepted` || actionInProgress === `${passenger.user}-rejected`}
                                            >
                                                {actionInProgress === `${passenger.user}-accepted` ? 'Approving...' : 'Approve'}
                                            </button>
                                            <button
                                                className="ptf-reject-btn"
                                                onClick={() => handleRequestAction(
                                                    selectedRide._id,
                                                    passenger.user,
                                                    'rejected'
                                                )}
                                                disabled={actionInProgress === `${passenger.user}-accepted` || actionInProgress === `${passenger.user}-rejected`}
                                            >
                                                {actionInProgress === `${passenger.user}-rejected` ? 'Rejecting...' : 'Reject'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PendingRequests;