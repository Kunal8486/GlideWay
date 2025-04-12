import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCar,
    faCalendarAlt,
    faChair,
    faMoneyBillWave,
    faRetweet,
    faUserFriends,
    faTimes,
    faMapMarkerAlt,
    faCircle
} from '@fortawesome/free-solid-svg-icons';

const MyRides = ({
    rides,
    handleRideClick,
    selectedRide,
    setSelectedRide,
    showCancelConfirm,
    setShowCancelConfirm,
    cancelReason,
    setCancelReason,
    handleCancelRide,
    handleRequestAction,
    actionInProgress,
    formatDate
}) => {
    return (
        <>
            <div className="ptf-rides-list">
                {rides.length > 0 ? (
                    rides.map(ride => (
                        <div
                            key={ride._id}
                            className={`ptf-ride-card ${ride.status === 'cancelled' ? 'ptf-cancelled' : ''}`}
                            onClick={() => handleRideClick(ride)}
                        >
                            <div className="ptf-ride-header">
                                <h3>
                                    {ride.origin} → {ride.destination}
                                </h3>
                                <span className={`ptf-status ptf-${ride.status}`}>{ride.status}</span>
                            </div>

                            <div className="ptf-ride-details">
                                <p>
                                    <FontAwesomeIcon icon={faCalendarAlt} /> {formatDate(ride.date)} at {ride.time}
                                </p>
                                <p>
                                    <FontAwesomeIcon icon={faChair} /> {ride.seatsAvailable} / {ride.seats} seats available
                                </p>
                                <p>
                                    <FontAwesomeIcon icon={faMoneyBillWave} /> ₹{ride.fare} per seat
                                </p>
                                {ride.isRecurringRide && (
                                    <p className="ptf-recurring">
                                        <FontAwesomeIcon icon={faRetweet} /> Recurring ride
                                    </p>
                                )}
                            </div>

                            <div className="ptf-passengers-preview">
                                <p><FontAwesomeIcon icon={faUserFriends} /> {ride.passengers.length} passengers</p>
                                {ride.passengers.some(p => p.status === 'pending') && (
                                    <span className="ptf-pending-alert">New requests!</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="ptf-empty-state">
                        <FontAwesomeIcon icon={faCar} size="3x" />
                        <p>You don't have any rides that match your filters.</p>
                        <button className="ptf-create-ride-btn" onClick={() => window.location.href = '/create-ride'}>
                            Create a Ride
                        </button>
                    </div>
                )}
            </div>

            {selectedRide && !showCancelConfirm && (
                <div className="ptf-modal-overlay">
                    <div className="ptf-ride-detail-modal">
                        <button
                            className="ptf-close-modal"
                            onClick={() => setSelectedRide(null)}
                        >
                            <FontAwesomeIcon icon={faTimes} className='ptf-close-icon' />
                        </button>

                        <div className={`ptf-ride-status-banner ptf-${selectedRide.status}`}>
                            {selectedRide.status === 'active' && 'Active Ride'}
                            {selectedRide.status === 'completed' && 'Ride Completed'}
                            {selectedRide.status === 'cancelled' && 'Ride Cancelled'}
                        </div>

                        <h2>Ride Details</h2>

                        <div className="ptf-ride-route">
                            <div className="ptf-route-point">
                                <span className="ptf-point ptf-origin">
                                    <FontAwesomeIcon icon={faCircle} className="ptf-origin-icon" />
                                </span>
                                <div>
                                    <h4>Origin</h4>
                                    <p>{selectedRide.origin}</p>
                                </div>
                            </div>
                            <div className="ptf-route-line"></div>
                            <div className="ptf-route-point">
                                <span className="ptf-point ptf-destination">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="ptf-destination-icon" />
                                </span>
                                <div>
                                    <h4>Destination</h4>
                                    <p>{selectedRide.destination}</p>
                                </div>
                            </div>
                        </div>

                        <div className="ptf-ride-info-grid">
                            <div className="ptf-info-item">
                                <h4>Date & Time</h4>
                                <p>{formatDate(selectedRide.date)} at {selectedRide.time}</p>
                            </div>
                            <div className="ptf-info-item">
                                <h4>Vehicle</h4>
                                <p>{selectedRide.vehicleType}</p>
                            </div>
                            <div className="ptf-info-item">
                                <h4>Seats</h4>
                                <p>{selectedRide.seatsAvailable} / {selectedRide.seats} available</p>
                            </div>
                            <div className="ptf-info-item">
                                <h4>Fare</h4>
                                <p>₹{selectedRide.fare} per seat</p>
                            </div>
                        </div>

                        {selectedRide.isRecurringRide && (
                            <div className="ptf-recurring-info">
                                <h4>Recurring Schedule</h4>
                                <p>This ride repeats on: {selectedRide.recurringDays.join(', ')}</p>
                            </div>
                        )}

                        {selectedRide.notes && (
                            <div className="ptf-ride-notes">
                                <h4>Notes</h4>
                                <p>{selectedRide.notes}</p>
                            </div>
                        )}

                        <h3>Passengers ({selectedRide.passengers.length})</h3>

                        <div className="ptf-passengers-list">
                            {selectedRide.passengers.length > 0 ? (
                                selectedRide.passengers.map(passenger => (
                                    <div key={passenger.user} className="ptf-passenger-item">
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
                                                <p>Status: <span className={`ptf-status ptf-${passenger.status}`}>{passenger.status}</span></p>
                                                <p>Pickup: {passenger.pickupLocation.address}</p>
                                            </div>
                                        </div>

                                        {passenger.status === 'pending' && (
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
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="ptf-no-passengers">No passengers yet</p>
                            )}
                        </div>

                        <div className="ptf-modal-actions">
                            {selectedRide.status === 'active' && (
                                <>
                                    <button
                                        className="ptf-edit-ride-btn"
                                        onClick={() => window.location.href = `/pooling/edit-ride/${selectedRide._id}`}
                                    >
                                        Edit Ride
                                    </button>
                                    <button
                                        className="ptf-cancel-ride-btn"
                                        onClick={() => setShowCancelConfirm(true)}
                                    >
                                        Cancel Ride
                                    </button>
                                </>
                            )}
                            {selectedRide.status === 'active' && selectedRide.isRecurringRide && (
                                <button
                                    className="ptf-manage-recurring-btn"
                                    onClick={() => window.location.href = `/manage-recurring/${selectedRide._id}`}
                                >
                                    Manage Recurring Rides
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showCancelConfirm && selectedRide && (
                <div className="ptf-modal-overlay">
                    <div className="ptf-cancel-confirm-modal">
                        <button
                            className="ptf-close-modal"
                            onClick={() => {
                                setShowCancelConfirm(false);
                                setCancelReason('');
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>

                        <h2>Cancel Ride</h2>
                        <p>Are you sure you want to cancel this ride?</p>
                        <p className="ptf-ride-summary">
                            <strong>{selectedRide.origin} → {selectedRide.destination}</strong><br />
                            {formatDate(selectedRide.date)} at {selectedRide.time}
                        </p>

                        <div className="ptf-passenger-impact">
                            <h4>This will impact:</h4>
                            <p>{selectedRide.passengers.filter(p => p.status === 'accepted').length} confirmed passengers</p>
                        </div>

                        <div className="ptf-reason-input">
                            <label htmlFor="cancelReason">Reason for cancellation (optional):</label>
                            <textarea
                                id="cancelReason"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Let your passengers know why you're cancelling..."
                                rows={3}
                            />
                        </div>

                        <div className="ptf-confirm-actions">
                            <button
                                className="ptf-back-btn"
                                onClick={() => {
                                    setShowCancelConfirm(false);
                                    setCancelReason('');
                                }}
                                disabled={actionInProgress === 'cancel'}
                            >
                                Back
                            </button>
                            <button
                                className="ptf-confirm-cancel-btn"
                                onClick={() => handleCancelRide(selectedRide._id)}
                                disabled={actionInProgress === 'cancel'}
                            >
                                {actionInProgress === 'cancel' ? 'Cancelling...' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyRides;