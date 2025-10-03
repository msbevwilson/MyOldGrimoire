import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import * as PropTypes from 'prop-types';
import styles from './Header.module.css';
import Logo from '../../images/Logo.png';

function Header({ user, setUser }) {
  const navigate = useNavigate();
  const disconnect = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  return (
    <header className={styles.Header}>
      <div className="container">
        <img src={Logo} alt="logo my old grimoire" />
        <ul>
          <li><NavLink to="/" end className={({ isActive }) => (isActive ? styles.activeLink : undefined)}>Home</NavLink></li>
          <li><NavLink to="/Add" className={({ isActive }) => (isActive ? styles.activeLink : undefined)}>Add a book</NavLink></li>
          <li>{!user ? <NavLink to="/SignIn" className={({ isActive }) => (isActive ? styles.activeLink : undefined)}>Log in</NavLink> : <span tabIndex={0} role="button" onKeyUp={disconnect} onClick={disconnect}>Log out</span> }</li>
        </ul>
      </div>
    </header>
  );
}

Header.propTypes = {
  user: PropTypes.shape({
    userId: PropTypes.string,
    token: PropTypes.string,
  }),
  setUser: PropTypes.func.isRequired,
};

Header.defaultProps = {
  user: null,
};
export default Header;
