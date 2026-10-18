import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="custom-footer">
      <div className="container">
        
        <div className="footer-content">
          
          {/* Column 1: About */}
          <div className="footer-section">
            <h3 className="footer-heading">Placement Help</h3>
            <p style={{ lineHeight: '1.6', marginTop: '10px' }}>
              Your trusted platform for placement preparation. Empowering students 
              to achieve their career goals with curated questions from top tech giants.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Support</Link></li>
              <li><Link to="/register" className="footer-link">Register</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="footer-section">
            <h3 className="footer-heading">Contact Us</h3>
            
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>palsumang56@gmail.com</span>
            </div>

            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>IIT BHU, Varanasi, India</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Study Website. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;