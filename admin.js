import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const IMGBB_API_KEY = "e94467019a9fbe7e2f7447dd755ec0fc";

const phoneInput = document.getElementById('settingWhatsapp');
const supportInput = document.getElementById('settingSupportWhatsapp');
const btnSavePhone = document.getElementById('btnSavePhone');

// جلب الأرقام الحالية
getDoc(doc(db, "settings", "whatsapp")).then(snap => {
    if(snap.exists()) {
        phoneInput.value = snap.data().number || "";
        supportInput.value = snap.data().supportNumber || "";
    }
});

// حفظ الأرقام
btnSavePhone.onclick = async () => {
    const rawNum = phoneInput.value.trim().replace(/[^0-9]/g, '');
    const rawSupportNum = supportInput.value.trim().replace(/[^0-9]/g, '');
    
    btnSavePhone.innerText = "جاري الحفظ...";
    btnSavePhone.disabled = true;
    
    await setDoc(doc(db, "settings", "whatsapp"), { 
        number: rawNum,
        supportNumber: rawSupportNum
    });
    
    alert("تم حفظ الأرقام بنجاح!");
    btnSavePhone.innerText = "حفظ الأرقام";
    btnSavePhone.disabled = false;
};

// رفع منتج جديد
const form = document.getElementById('addForm');
const btn = document.getElementById('btnSubmit');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('pTitle').value;
    const price = document.getElementById('pPrice').value;
    const category = document.getElementById('pCategory').value;
    const file = document.getElementById('pImage').files[0];

    try {
        btn.innerText = "جاري رفع الصورة...";
        btn.disabled = true;

        const formData = new FormData();
        formData.append("image", file);
        const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
        const imgData = await imgRes.json();
        if (!imgData.success) throw new Error("فشل رفع الصورة");

        btn.innerText = "جاري الحفظ في Firebase...";
        await addDoc(collection(db, "products"), {
            title: title,
            price: Number(price),
            category: category,
            imageUrl: imgData.data.url,
            isSold: false,
            createdAt: Date.now()
        });

        alert("تم حفظ المنتج بنجاح!");
        form.reset();
    } catch (err) {
        alert("خطأ: " + err.message);
    } finally {
        btn.innerText = "نشر المنتج";
        btn.disabled = false;
    }
});

// قائمة المنتجات
const adminList = document.getElementById('adminList');
onSnapshot(collection(db, "products"), (snapshot) => {
    adminList.innerHTML = "";
    snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const id = docSnap.id;
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
            <div><strong>${item.title}</strong> - ${item.price} دج ${item.isSold ? '<b style="color:#ef4444;"> (SOLD)</b>' : ''}</div>
            <div>
                <button class="btn-warning" id="sold-${id}">${item.isSold ? 'متاح' : 'SOLD'}</button>
                <button class="btn-danger" id="del-${id}">حذف</button>
            </div>
        `;
        adminList.appendChild(div);
        document.getElementById(`sold-${id}`).onclick = () => updateDoc(doc(db, "products", id), { isSold: !item.isSold });
        document.getElementById(`del-${id}`).onclick = () => { if(confirm("حذف المنتج؟")) deleteDoc(doc(db, "products", id)); };
    });
});