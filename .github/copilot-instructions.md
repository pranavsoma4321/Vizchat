# Chatbot Codebase - AI Agent Instructions

## Project Overview

**NexusBot** is a Flask-based chatbot application with dual authentication backends (SQLAlchemy + Firebase). The app enables users to create, customize, and manage AI chatbots with configurable models and knowledge base uploads.

**Architecture**: Flask backend + Jinja2 templates + Tailwind CSS frontend + optional Firebase integration for auth/firestore.

---

## Core Architecture

### Backend Stack
- **Framework**: Flask 2.3.3 (session-based auth)
- **Database**: SQLite (SQLAlchemy ORM) for user management
- **Optional**: Firebase Admin SDK for cloud auth/firestore (see `firebase_setup.py`)
- **Security**: Werkzeug password hashing (bcrypt fallback available)

### Frontend Stack
- **Templating**: Jinja2 (extends `base.html`)
- **Styling**: Tailwind CSS 2.x (CDN-based)
- **Authentication UI**: Firebase Web SDK (modular JS in `static/`)
- **Current Pages**: login, signup, home, customize_upload, choose_model, customize_chatbot

### Data Flow
1. **User Registration/Login**: Form POST → `app.py` → User model → Session storage
2. **Protected Routes**: `@login_required` decorator checks `session['user_id']`
3. **Optional Firebase Path**: `firebase-config.js` initializes client-side auth; `firestore` stores user metadata

---

## Project-Specific Patterns

### Authentication Model
- **Session-based** (primary): `session['user_id']` + `session['username']` set on successful login
- **Decorator Pattern**: `@login_required(f)` wraps protected routes—see `app.py` lines 47-53
- **Firebase (optional)**: `auth.create_user()` + Firestore document in `users/{uid}` collection
- **Convention**: Always pass `username` to templates via `session.get('username', 'Guest')`

### Route Structure
All routes render templates and pass `username` context:
```python
@app.route("/customize_chatbot")
def customize_chatbot():
    return render_template("customize_chatbot.html", username=session.get('username', 'Guest'))
```
Follow this pattern for new protected routes.

### Database Models
Only `User` model currently implemented (`app.py` lines 18-35):
- Fields: `id`, `username`, `email`, `password_hash`, `created_at`
- Methods: `set_password()`, `check_password()`, `__repr__()` for hashing
- Add new models in `app.py` before `db.create_all()` call

### Frontend Base Template
[base.html](templates/base.html) provides:
- Navbar with login/logout/signup buttons
- Flash message system (top-right toast notifications)
- Tailwind dark theme (gray-900 background, white text)
- Jinja blocks: `{% block title %}`, `{% block content %}`

All template pages should extend `base.html` or use its navbar pattern for consistency.

---

## Critical Developer Workflows

### Setup & Running
```bash
# Install dependencies
pip install -r requirements.txt
# Optional: Firebase support
pip install -r firebase_requirements.txt

# Initialize database (creates chatbot.db)
python app.py
# App runs on http://localhost:5000 (debug mode)
```

### Adding a New Protected Route
1. Create template in `templates/` folder
2. Add route in `app.py` with `@login_required` decorator
3. Pass `username=session.get('username', 'Guest')` to `render_template()`
4. Reference template blocks: `{% extends "base.html" %}`

### Firebase Integration (if needed)
1. Place `serviceAccountKey.json` in project root (see `firebase_setup.py`)
2. Import: `import firebase_admin; from firebase_admin import credentials, firestore`
3. Initialize: `cred = credentials.Certificate(...)`
4. Use `db.collection('users').document(uid).set({...})` for Firestore operations

---

## Integration Points & Dependencies

### External Services
- **Firebase Auth** (optional): Email/password via `https://www.gstatic.com/firebasejs/10.7.1/`
- **Firestore Database** (optional): Cloud storage for user metadata
- **Tailwind CDN**: `https://cdn.tailwindcss.com` (no build step)
- **Google Fonts**: Inter font via googleapis CDN

### Key File Dependencies
- `app.py` ← `requirements.txt` (Flask, SQLAlchemy, Werkzeug)
- `templates/*.html` ← `base.html` (navbar, flash messages)
- `login.html` ← `static/firebase-config.js` (if Firebase enabled)
- `firebase_setup.py` ← `serviceAccountKey.json` (Firebase credentials, git-ignored)

### Known Gaps
- No API endpoints (forms are synchronous POST)
- No test suite yet
- Frontend JavaScript minimal (`static/script.js` empty)
- No logging/error monitoring configured

---

## Common Pitfalls to Avoid

1. **Session Key Mismatch**: Always use exact keys: `session['user_id']` and `session['username']`—typos break auth.
2. **Template Inheritance**: New templates must extend `base.html` or manually include navbar/flash logic.
3. **Secret Key**: `app.secret_key = "your-secret-key"` in `app.py` line 8—change in production!
4. **Database Transactions**: Use `db.session.commit()` after mutations; missing commit silently fails.
5. **Firebase Config Exposure**: `firebase-config.js` contains public API key (expected), but `serviceAccountKey.json` must stay in `.gitignore`.
6. **Missing Username Context**: Routes without `username=session.get(...)` will break navbar display.

---

## Recent Architecture Changes

- Migrated from basic HTML login to dual-auth support (SQLAlchemy + Firebase option)
- Introduced `@login_required` decorator for DRY protected route pattern
- Added Firestore optional integration for scalability (reference in `firebase_setup.py`)
- Tailwind CDN replaced custom CSS for rapid styling

---

## Recommended Practices for This Codebase

- **Keep session keys centralized**: Create a config file if adding more session variables
- **Test auth flows**: Use `test-auth.html` (referenced in README-FIREBASE.md) for Firebase login tests
- **Extend base.html**: New pages should inherit navbar and flash messages
- **Log database operations**: Consider adding debug logs before `db.session.commit()` calls
- **Validate input server-side**: HTML form validation alone isn't sufficient (see signup/login)
- **Environment variables**: Move secrets (`secret_key`, Firebase creds) to `.env` file (use `python-dotenv`)
