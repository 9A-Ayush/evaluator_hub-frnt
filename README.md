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
📂 evaluator-hub-frontend/
├── index.html
├── login.html
├── signup.html
├── reports.html
├── profile.html
├── evaluations.html
├── jewelry.html
├── property.html
├── vehicles.html
├── forgotPassword.html
├── resetPassword.html
├── css/
│   └── style.css
├── js/
│   └── main.js

❤️ Acknowledgements
Made with love for modern evaluation workflows 💎
Feel free to fork, star, or contribute!

📬 Contact
Drop your questions, suggestions, or collab requests 😉
Email: wemayush@gmail.com
GitHub: @9A-Ayush
 
