import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    const [role, setRoleState] = useState('moderator'); // default role

    const setRole = (newRole) => {
        if (['user', 'moderator'].includes(newRole)) {
            setRoleState(newRole);
        } else {
            console.warn('Invalid role:', newRole);
        }
    };

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const res = await axios.get('/api/me'); // replace with real endpoint
                const user = res.data;
                setRole(user.role);
            } catch (err) {
                console.error('Error fetching user role', err);
            }
        };
        fetchUserRole();
    }, []);

    return (
        <RoleContext.Provider value={{ role, setRole }}>
            {children}
            {console.log("Current Role:",{role})}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used inside RoleProvider');
    }
    return context;
};
