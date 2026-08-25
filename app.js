import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDliJ0jRFnr_50Z16NQLDBPl5zd7C3HtKU",
  authDomain: "daridz-52ab3.firebaseapp.com",
  projectId: "daridz-52ab3",
  storageBucket: "daridz-52ab3.firebasestorage.app",
  messagingSenderId: "524450237529",
  appId: "1:524450237529:web:6005fbf604f5c99ac53548",
  measurementId: "G-LDJBTFMVSC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let orderWhatsappNumber = ""; 
let supportWhatsappNumber = "";

// الاستماع المباشر للأرقام من لوحة التحكم
onSnapshot(doc(db, "settings", "whatsapp"), (snap) => {
    if (snap.exists()) {
        const data = snap.data();
        orderWhatsappNumber = data.number || "";
        supportWhatsappNumber = data.supportNumber || "";
        
        const supportBtnLink = document.getElementById('supportBtnLink');
        if (supportBtnLink) {
            supportBtnLink.href = supportWhatsappNumber ? `https://wa.me/${supportWhatsappNumber}` : '#';
        }
        renderProducts();
    }
});

// إدارة فتح وإغلاق القائمة المنسدلة
const menuBtn = document.getElementById('menuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');

menuBtn.onclick = (e) => { 
    e.stopPropagation(); 
    dropdownMenu.classList.toggle('show'); 
};

// منع إغلاق القائمة عند التفاعل مع عنصر اختيار اللغة
document.getElementById('langContainer').onclick = (e) => {
    e.stopPropagation();
};

document.onclick = (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== menuBtn) {
        dropdownMenu.classList.remove('show');
    }
};

// الوضع الداكن
const toggleTheme = document.getElementById('toggleTheme');
toggleTheme.onclick = (e) => {
    e.stopPropagation();
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    document.getElementById('themeText').innerText = isDark 
        ? (currentLang === 'ar' ? 'الوضع الفاتح' : currentLang === 'fr' ? 'Mode Clair' : 'Light Mode') 
        : (currentLang === 'ar' ? 'الوضع الداكن' : currentLang === 'fr' ? 'Mode Sombre' : 'Dark Mode');
};

// اللغات (AR, EN, FR)
let currentLang = 'ar';
const translations = {
    ar: { heroTitle: "مرحباً بك في ", heroSub: "تسوق أحدث المنتجات بأفضل الأسعار مع التوصيل السريع", orderBtn: "أطلب عبر واتساب", soldBtn: "نفذت الكمية (SOLD)", currency: "دج", dark: "الوضع الداكن", support: "Contact Support", dir: "rtl" },
    en: { heroTitle: "Welcome to ", heroSub: "Shop the latest products at best prices with fast delivery", orderBtn: "Order via WhatsApp", soldBtn: "Out of Stock (SOLD)", currency: "DZD", dark: "Dark Mode", support: "Contact Support", dir: "ltr" },
    fr: { heroTitle: "Bienvenue sur ", heroSub: "Achetez les derniers produits au meilleur prix avec livraison rapide", orderBtn: "Commander via WhatsApp", soldBtn: "Épuisé (SOLD)", currency: "DZD", dark: "Mode Sombre", support: "Contact Support", dir: "ltr" }
};

const langSelect = document.getElementById('langSelect');
langSelect.onchange = (e) => {
    currentLang = e.target.value;
    const t = translations[currentLang];
    document.documentElement.dir = t.dir;
    document.getElementById('heroSubtitle').innerText = t.heroSub;
    document.getElementById('themeText').innerText = document.body.classList.contains('dark') ? (currentLang === 'ar' ? 'الوضع الفاتح' : currentLang === 'fr' ? 'Mode Clair' : 'Light Mode') : t.dark;
    document.getElementById('supportText').innerText = t.support;
    renderProducts();
};

// عرض المنتجات
let cachedDocs = [];
const grid = document.getElementById('productsGrid');

onSnapshot(collection(db, "products"), (snapshot) => {
    cachedDocs = snapshot.docs;
    renderProducts();
});

function renderProducts() {
    grid.innerHTML = "";
    const t = translations[currentLang];
    if (cachedDocs.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align:center;'>لا توجد منتجات حالياً.</p>";
        return;
    }

    cachedDocs.forEach((docSnap) => {
        const p = docSnap.data();
        const msg = encodeURIComponent(`السلام عليكم، أريد طلب: ${p.title} (${p.price} ${t.currency})`);
        const whatsappUrl = orderWhatsappNumber ? `https://wa.me/${orderWhatsappNumber}?text=${msg}` : '#';
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div>
                <img src="${p.imageUrl}" class="card-img" alt="${p.title}">
                <div class="card-body">
                    <h3 class="card-title">${p.title}</h3>
                    <div class="card-price">${p.price} ${t.currency}</div>
                </div>
            </div>
            <div style="padding: 0 14px 14px 14px;">
                ${p.isSold 
                    ? `<button class="btn-sold">${t.soldBtn}</button>`
                    : `<a href="${whatsappUrl}" target="_blank" class="btn-whatsapp"><i class="fa-brands fa-whatsapp"></i> ${t.orderBtn}</a>`
                }
            </div>
        `;
        grid.appendChild(card);
    });
}