import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useVault } from '../../hooks/useVault';
export const ProtectedRoute = ({ children }) => {
    const { isLoggedIn } = useVault();
    const location = useLocation();
    if (!isLoggedIn) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
