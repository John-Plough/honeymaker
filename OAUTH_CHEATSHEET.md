# OAuth Implementation Cheatsheet - Snake Game

## 1. Backend Setup (Ruby on Rails)

### Key Files

```
config/initializers/omniauth.rb      # OAuth provider configuration
app/controllers/auth_controller.rb    # Handles OAuth callbacks
app/controllers/users_controller.rb   # Regular user registration
app/models/user.rb                   # User model with validations
```

### Database Schema

```ruby
User Model Fields:
- email (string, unique)
- username (string, unique)
- password_digest (string)
- github_uid (string, unique)
- google_uid (string, unique)
```

### OAuth Provider Configuration

```ruby
# config/initializers/omniauth.rb
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :github, ENV["GITHUB_CLIENT_ID"], ENV["GITHUB_CLIENT_SECRET"],
    scope: "user:email",
    callback_path: "/auth/github/callback"

  provider :google_oauth2, ENV["GOOGLE_CLIENT_ID"], ENV["GOOGLE_CLIENT_SECRET"],
    scope: "email profile",
    callback_path: "/auth/google_oauth2/callback"
end
```

## 2. Authentication Flow

### A. Regular Sign Up

1. User enters email, username, password
2. Creates account with:
   - email and username stored as provided
   - password hashed (password_digest)
   - github_uid and google_uid are nil

### B. OAuth First-Time Login

1. User clicks GitHub/Google button
2. Provider authenticates user
3. System checks:

   ```ruby
   # 1. Look for existing OAuth link
   user = User.find_by(github_uid: auth_hash["uid"])

   # 2. If not found, check email
   existing_user = User.find_by(email: auth_hash["info"]["email"])

   # 3. Either:
   #    a) Create new user if email is new
   #    b) Link provider to existing account if email exists
   ```

### C. Account Linking Logic

```
If email not in system:
  → Create new account with provider info
  → Set provider's UID
  → Use provider's username

If email exists but no provider UID:
  → Link provider to existing account
  → Keep original username
  → Set provider's UID

If email exists with different provider:
  → Show error "Email already registered"
```

## 3. Frontend Implementation (JavaScript)

### Key Files

```
auth.js    # Handles authentication UI and API calls
game.js    # Uses auth for score submission
```

### OAuth Button Implementation

```javascript
// Create form for OAuth submission
const form = document.createElement("form");
form.method = "post";
form.action = `${API_BASE}/auth/github`; // or google_oauth2

// Add CSRF protection
const csrfInput = document.createElement("input");
csrfInput.type = "hidden";
csrfInput.name = "authenticity_token";
csrfInput.value = getCookie("CSRF-TOKEN");
form.appendChild(csrfInput);

// Submit form
document.body.appendChild(form);
form.submit();
```

## 4. Authentication Methods

### Available Login Methods

1. Email + Password
2. GitHub OAuth
3. Google OAuth

### How They Connect

```
One User Account can have:
- Email + Password (always)
- GitHub connection (optional)
- Google connection (optional)

All methods access same account if emails match
```

## 5. Security Features

### Email Uniqueness

- One email = One account
- Prevents duplicate accounts
- Enables automatic provider linking

### Provider UIDs

- Unique for each provider
- Stored separately (github_uid, google_uid)
- Prevents cross-provider conflicts

### Session Management

```ruby
# Set session on successful auth
session[:user_id] = user.id

# Clear session on logout
session.delete(:user_id)
```

## 6. Common Scenarios

### First-Time OAuth User

```
1. No existing account
2. Creates new account
3. Sets provider UID
4. Uses provider's username
```

### Linking New Provider

```
1. Finds existing account by email
2. Verifies email ownership via OAuth
3. Adds provider's UID to account
4. Keeps original username
```

### Conflict Resolution

```
If email exists with different provider:
- Prevents new account creation
- Shows error message
- Preserves account security
```

This implementation provides:

- Seamless authentication across methods
- Secure account linking
- Prevention of account duplication
- Consistent user experience
