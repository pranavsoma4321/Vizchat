// Intersection Observer to trigger fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all section-fade-in elements
document.querySelectorAll('.section-fade-in').forEach(el => {
  observer.observe(el);
});

// Login/Logout Button Functionality
const loginBtn = document.getElementById('loginBtn');
const loginBtnMobile = document.getElementById('loginBtnMobile');
const logoutBtn = document.getElementById('logoutBtn');
const logoutBtnMobile = document.getElementById('logoutBtnMobile');
const usernameDisplay = document.getElementById('usernameDisplay');

// Function to update button visibility based on auth state
function updateAuthButtons() {
  // Get username from Flask session via data attribute
  const usernameElement = document.getElementById('usernameDisplay');
  const username = usernameElement ? usernameElement.getAttribute('data-username') : null;
  
  console.log('=== Auth Debug ===');
  console.log('Username element found:', !!usernameElement);
  console.log('Username from Flask session:', username);
  console.log('Login button found:', !!loginBtn);
  console.log('Logout button found:', !!logoutBtn);
  console.log('Login button current display:', loginBtn ? loginBtn.style.display : 'N/A');
  console.log('Logout button current display:', logoutBtn ? logoutBtn.style.display : 'N/A');
  
  if (username && username !== 'Guest') {
    console.log('User is logged in, showing logout button');
    // User is logged in - show logout, hide login
    if (loginBtn) {
      loginBtn.style.display = 'none';
      console.log('Hiding login button');
    }
    if (loginBtnMobile) {
      loginBtnMobile.style.display = 'none';
    }
    if (logoutBtn) {
      logoutBtn.style.display = 'block';
      logoutBtn.classList.remove('hidden');
      console.log('Showing logout button');
    }
    if (logoutBtnMobile) {
      logoutBtnMobile.style.display = 'block';
      logoutBtnMobile.classList.remove('hidden');
    }
    
    // Display username
    if (usernameDisplay) {
      usernameDisplay.textContent = `Welcome, ${username}!`;
      usernameDisplay.style.display = 'block';
      console.log('Setting username display:', `Welcome, ${username}!`);
    }

    // Don't render recent bots from Firebase since we're using Flask session
    // renderRecentBots(user.uid);
  } else {
    console.log('User is logged out, showing login button');
    // User is logged out - show login, hide logout
    if (loginBtn) {
      loginBtn.style.display = 'block';
      loginBtn.classList.remove('hidden');
    }
    if (loginBtnMobile) {
      loginBtnMobile.style.display = 'block';
      loginBtnMobile.classList.remove('hidden');
    }
    if (logoutBtn) {
      logoutBtn.style.display = 'none';
      logoutBtn.classList.add('hidden');
    }
    if (logoutBtnMobile) {
      logoutBtnMobile.style.display = 'none';
      logoutBtnMobile.classList.add('hidden');
    }
    if (usernameDisplay) {
      usernameDisplay.style.display = 'none';
    }

    const recentBotsSection = document.getElementById('recentBotsSection');
    const recentBotsList = document.getElementById('recentBotsList');
    if (recentBotsSection) recentBotsSection.classList.add('hidden');
    if (recentBotsList) recentBotsList.innerHTML = '';
  }
  console.log('=== End Auth Debug ===');
}

// Update buttons on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, updating auth buttons...');
  updateAuthButtons();
});

// Also update immediately in case DOM is already loaded
updateAuthButtons();

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    window.location.href = '/login';
  });
}

if (loginBtnMobile) {
  loginBtnMobile.addEventListener('click', () => {
    window.location.href = '/login';
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    window.location.href = '/logout';
  });
}

if (logoutBtnMobile) {
  logoutBtnMobile.addEventListener('click', () => {
    window.location.href = '/logout';
  });
}

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // Close menu when a link is clicked
  mobileMenu.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

// Smooth scroll behavior for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
