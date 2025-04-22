import React from 'react';
import SignIn from "../screens/auth/SignIn";

const RequireAuthentication = ({ userToken, ...props }) => {
    
    const ProtectedComponent = props.Component || props.Cart || props.Payment;
    
    if (!userToken) {
        return <SignIn {...props} />;
    }
    
    return <ProtectedComponent {...props} />;
};

export default RequireAuthentication;