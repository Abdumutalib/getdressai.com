// script.js
// GetDressAI front-end logic

// SPA навигация
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');

function navigateTo(page) {
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    navLinks.forEach(l => l.classList.remove('active'));
    navLinks.forEach(l => {
        if (l.dataset.page === page) l.classList.add('active');
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(link.dataset.page);
    });
});

// Responsive меню
const menuBtn = document.getElementById('menuBtn');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('show');
    });
}

// Онлайн статус
function updateOnlineStatus() {
    const status = document.getElementById('onlineStatus');
    const dot = status.querySelector('.status-dot');
    if (navigator.onLine) {
        status.innerHTML = '<span class="status-dot"></span> Онлайн';
    } else {
        status.innerHTML = '<span class="status-dot offline"></span> Офлайн';
    }
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Кийим тавсияси
async function getOutfitRecommendation() {
    const btn = document.querySelector('#page-outfit .submit-btn');
    const loader = btn.querySelector('.btn-loader');
    const text = btn.querySelector('.btn-text');
    btn.disabled = true; loader.style.display = 'inline'; text.style.display = 'none';
    const gender = document.getElementById('gender').value;
    const style = document.getElementById('style').value;
    const season = document.getElementById('season').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    try {
        const res = await fetch('/api/outfit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({gender, style, season, minPrice, maxPrice})
        });
        const data = await res.json();
        const result = document.getElementById('recommendation-result');
        if (data.success) {
            result.innerHTML = `<h3>Тавсия:</h3><p>${data.recommendation}</p>`;
            result.style.display = 'block';
        } else {
            result.innerHTML = `<p style='color:red;'>${data.error || 'Хатолик юз берди'}</p>`;
            result.style.display = 'block';
        }
    } catch (e) {
        document.getElementById('recommendation-result').innerHTML = `<p style='color:red;'>Сервер билан алоқа йўқ</p>`;
    }
    btn.disabled = false; loader.style.display = 'none'; text.style.display = 'inline';
}

// Расм генерацияси
async function generateOutfitImage() {
    const btn = document.querySelector('#page-image .submit-btn');
    const loader = btn.querySelector('.btn-loader');
    const text = btn.querySelector('.btn-text');
    btn.disabled = true; loader.style.display = 'inline'; text.style.display = 'none';
    const prompt = document.getElementById('imagePrompt').value;
    const quality = document.getElementById('imageQuality').value;
    try {
        const res = await fetch('/api/image', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({prompt, quality})
        });
        const data = await res.json();
        const result = document.getElementById('image-result');
        if (data.success) {
            result.innerHTML = `<img src="${data.imageUrl}" alt="AI Image" /><p>${data.prompt}</p>`;
            result.style.display = 'block';
        } else {
            result.innerHTML = `<p style='color:red;'>${data.error || 'Хатолик юз берди'}</p>`;
            result.style.display = 'block';
        }
    } catch (e) {
        document.getElementById('image-result').innerHTML = `<p style='color:red;'>Сервер билан алоқа йўқ</p>`;
    }
    btn.disabled = false; loader.style.display = 'none'; text.style.display = 'inline';
}

// Auth (register/login)
async function register() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    if (!email || !password) return alert('Email ва паролни тўлдиринг');
    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (data.success) {
            alert('Муваффақиятли рўйхатдан ўтдингиз!');
            document.getElementById('userName').textContent = data.name || email;
            document.getElementById('authCard').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'block';
        } else {
            alert(data.error || 'Хатолик юз берди');
        }
    } catch (e) {
        alert('Сервер билан алоқа йўқ');
    }
}

async function login() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    if (!email || !password) return alert('Email ва паролни тўлдиринг');
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (data.success) {
            alert('Хуш келибсиз!');
            document.getElementById('userName').textContent = data.name || email;
            document.getElementById('authCard').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'block';
        } else {
            alert(data.error || 'Хатолик юз берди');
        }
    } catch (e) {
        alert('Сервер билан алоқа йўқ');
    }
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    document.getElementById('userName').textContent = 'Меҳмон';
    document.getElementById('authCard').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
});

// Upgrade (Pro) тугмаси
const upgradeBtn = document.getElementById('upgradeBtn');
if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
        // Paddle/Stripe checkout интеграцияси
        alert('Pro режага ўтиш учун тўлов ойнаси очилади (интеграция қилиш керак)');
    });
}

// Default page
if (window.location.hash) {
    const page = window.location.hash.replace('#', '');
    if (document.getElementById('page-' + page)) navigateTo(page);
} else {
    navigateTo('home');
}
