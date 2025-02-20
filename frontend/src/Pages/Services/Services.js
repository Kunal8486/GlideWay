import React from 'react';

const Services = () => {
    const services = [
        { id: 1, name: 'Web Development', description: 'Building responsive and high-quality websites.' },
        { id: 2, name: 'Mobile App Development', description: 'Creating user-friendly mobile applications.' },
        { id: 3, name: 'UI/UX Design', description: 'Designing intuitive and engaging user interfaces.' },
        { id: 4, name: 'SEO Optimization', description: 'Improving website visibility on search engines.' },
        { id: 5, name: 'Digital Marketing', description: 'Promoting your business through digital channels.' },
    ];

    return (
        <div>
            <h1>Our Services</h1>
            <ul>
                {services.map(service => (
                    <li key={service.id}>
                        <h2>{service.name}</h2>
                        <p>{service.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Services;