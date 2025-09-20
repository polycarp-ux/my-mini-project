document.addEventListener('DOMContentLoaded', function () {
  const auth = firebase.auth();

  // Toggle password visibility
  const togglePasswordBtns = document.querySelectorAll('.toggle-password');
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const input = this.parentElement.querySelector('input');
      const icon = this.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });

  // Password strength checker
  const passwordInput = document.getElementById('password');
  const passwordStrengthBars = document.querySelectorAll('.strength-bar');
  if (passwordInput) {
    passwordInput.addEventListener('input', function () {
      const password = this.value;
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength++;
      passwordStrengthBars.forEach((bar, index) => {
        bar.style.backgroundColor = index < strength ? getStrengthColor(strength) : 'var(--gray-light)';
      });
      const strengthText = document.querySelector('.strength-text');
      if (strengthText) {
        strengthText.textContent = getStrengthText(strength);
        strengthText.style.color = getStrengthColor(strength);
      }
    });
  }

  function getStrengthColor(strength) {
    return ['var(--gray-light)', 'var(--error-color)', 'var(--warning-color)', 'var(--success-color)'][strength];
  }

  function getStrengthText(strength) {
    return ['Very weak', 'Weak', 'Moderate', 'Strong'][strength] || 'Password strength';
  }

  // Sign up form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
          alert('Account created! Redirecting...');
          window.location.href = 'Getstarted.html';
        })
        .catch(error => alert(error.message));
    });
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          alert('Login successful! Redirecting...');
          window.location.href = 'Getstarted.html';
        })
        .catch(error => alert(error.message));
    });
  }

  // Google & Facebook auth
  const socialButtons = document.querySelectorAll('.social-btn');
  socialButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      let provider;
      if (this.classList.contains('google-btn')) {
        provider = new firebase.auth.GoogleAuthProvider();
      } else if (this.classList.contains('facebook-btn')) {
        provider = new firebase.auth.FacebookAuthProvider();
      }
      auth.signInWithPopup(provider)
        .then(() => {
          alert('Signed in successfully!');
          window.location.href = 'Getstarted.html';
        })
        .catch(error => alert(error.message));
    });
  });

  // Optional: monitor auth state
  auth.onAuthStateChanged(user => {
    if (user) console.log('Logged in as:', user.email);
  });
});
