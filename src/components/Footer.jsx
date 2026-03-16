import { Link } from 'react-router-dom';
import facebookIcon from '../assets/facebook.png';
import instagramIcon from '../assets/instagram.png';
import xIcon from '../assets/x.png';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <Link to="/" className="logo">SLUSH</Link>
          <div className="social-icons">
            <a href="#" className="icon" target="_blank" rel="noreferrer">
              <img src={facebookIcon} alt="Facebook" />
            </a>
            <a href="#" className="icon" target="_blank" rel="noreferrer">
              <img src={instagramIcon} alt="Instagram" />
            </a>
            <a href="#" className="icon" target="_blank" rel="noreferrer">
              <img src={xIcon} alt="X" />
            </a>
          </div>
        </div>
        
        <p className="copyright-text">
          © 2026, Slush inc. All rights reserved. Slush, the Slush logo are trademarks or registered trademarks of Slush inc. in Ukraine and elsewhere. Other brands or product names are the trademarks of their respective owners.
        </p>

        <div className="footer-links">
          <Link to="#">Умови використання</Link>
          <Link to="#">Політика конфіденційності</Link>
          <Link to="#">Політика повернення коштів магазину</Link>
        </div>
      </div>
    </footer>
  );
}