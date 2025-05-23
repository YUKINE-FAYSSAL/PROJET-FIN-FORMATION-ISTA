import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// **أضف jQuery هنا قبل Bootstrap JS**
import 'jquery';

// Bootstrap JS bundle (يشمل Popper)
import 'bootstrap/dist/js/bootstrap.bundle.min';

// Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import './components/Navbar/UnifiedNavbar';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
