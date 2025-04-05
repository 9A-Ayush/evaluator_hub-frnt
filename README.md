# Evaluator Hub - Frontend 💻✨

This is the **frontend** of the Evaluator Hub project – a powerful platform to manage evaluations, properties, jewelry, vehicles, and more, with login/signup, reporting, and user management features.

---

## 🌐 Live Preview

Frontend: [Live on Vercel / Netlify](https://your-frontend-link.vercel.app)  
Backend API: [Live on Render](https://evaluator-hub-backend.onrender.com)

---

## 🛠️ Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript

---

## 🚀 Deployment

### 🧩 Frontend Hosted On: `Vercel / Netlify`

- No build step needed
- Static files (`.html`, `.css`, `.js`) auto-deployed from root

### 🔗 Backend API: `Render`

Make sure API calls inside your JS files use your deployed backend URL like:

```js
const apiURL = "https://evaluator-hub-backend.onrender.com";

fetch(`${apiURL}/api/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ data })
});
