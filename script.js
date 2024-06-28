
document.addEventListener("DOMContentLoaded", function() {
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('reg_username').value;
        const password = document.getElementById('reg_password').value;

        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const message = document.getElementById('register_message');
        if (response.status === 201) {
            message.textContent = `تم التسجيل بنجاح كـ ${username}`;
            message.style.color = 'green';
        } else {
            const error = await response.text();
            message.textContent = `خطأ في التسجيل: ${error}`;
        }
    });

    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('login_username').value;
        const password = document.getElementById('login_password').value;

        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const message = document.getElementById('login_message');
        if (response.status === 200) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            message.textContent = `تم تسجيل الدخول بنجاح كـ ${username}`;
            message.style.color = 'green';
            document.getElementById('questionForm').style.display = 'block';
            displayPoints();
        } else {
            const error = await response.text();
            message.textContent = `خطأ في تسجيل الدخول: ${error}`;
        }
    });

    const questionForm = document.getElementById('questionForm');
    questionForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const token = localStorage.getItem('token');
        const question = document.getElementById('question').value;
        const correctAnswer = document.getElementById('correct_answer').value;

        const response = await fetch('http://localhost:3000/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ question, correctAnswer })
        });

        const message = document.getElementById('question_message');
        if (response.status === 201) {
            message.textContent = 'تم إضافة السؤال بنجاح';
            message.style.color = 'green';
        } else {
            const error = await response.text();
            message.textContent = `خطأ في إضافة السؤال: ${error}`;
        }
    });

    async function displayPoints() {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/points', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const message = document.getElementById('points_message');
        if (response.status === 200) {
            const data = await response.json();
            message.textContent = `نقاطك الحالية: ${data.points}`;
            message.style.color = 'blue';
        } else {
            const error = await response.text();
            message.textContent = `خطأ في عرض النقاط: ${error}`;
        }
    }
});
