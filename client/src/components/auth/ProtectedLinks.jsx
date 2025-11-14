import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


//  ProtectedLink
//  * - If user is authenticated (token present in redux or localStorage), navigates to `to`.
//  * - Otherwise redirects to /login and stores desired destination in location.state.from


const ProtectedLink = ({ to = '/', children, className = '', ...props }) => {
  const tokenFromStore = useSelector(state => state.auth?.token);
  // fallback to localStorage in case Redux hasn't loaded yet
  const token = tokenFromStore || localStorage.getItem('token');
  const navigate = useNavigate();

  const handleClick = (e) => {
    // Prevent default navigation behavior if rendered as an <a>
    if (e && e.preventDefault) e.preventDefault();
    if (token) {
      navigate(to);
    } else {
      // send the user to login and remember where they wanted to go
      navigate('/login', { state: { from: to } });
    }
  };

  // Render a semantic button-like anchor so styling remains easy
  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
};

export default ProtectedLink;