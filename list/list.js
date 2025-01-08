// const basicUrl = "https://chords-server.onrender.com";//in cloud environment
const basicUrl = "http://localhost:3000";//in local environment

window.onload = function () {
    fetchDocuments();
    applyDarkMode();
};

function displayDocuments(documents) {
    const container = document.getElementById("documents-container");
    container.innerHTML = ""; // מחיקת תוכן קודם
    documents.forEach(doc => {
        const card = document.createElement("div");
        card.className = "document-card";
        const title = document.createElement("h3");
        title.textContent = doc.name;

        
        const date = document.createElement("div");
        date.className = "date";
        const formattedDate = new Date(doc.createdAt).toLocaleDateString("he-IL", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        date.textContent = `נכתב בתאריך: ${formattedDate}`;
        const content = document.createElement("div");
        content.className = "content";
        content.innerHTML = doc.content;
        const id = `con${doc.id}`;
        content.id = id;

        // כפתור טרנספוזיציה כלפי למעלה
        const transposeUpButton = document.createElement("button");
        transposeUpButton.className = "transpose-button";
        transposeUpButton.innerHTML = "<i class='fas fa-plus'></i>"; // אייקון של הוספה (פלוס)
        // transposeUpButton.innerHTML = "&#x2191;"; // חץ למעלה

        transposeUpButton.className = "transpose-button up";

        transposeUpButton.onclick = () => transposeSongContent(doc.content, 1, id, doc); // טרנספוזיציה למעלה

        // כפתור טרנספוזיציה כלפי למטה
        const transposeDownButton = document.createElement("button");
        transposeDownButton.className = "transpose-button";
        // transposeDownButton.innerHTML = "&#x2193;"; // חץ למטה
        transposeDownButton.innerHTML = "<i class='fas fa-minus'></i>"; // אייקון של הורדה (מינוס)

        transposeDownButton.onclick = () => transposeSongContent(doc.content, -1, id, doc); // טרנספוזיציה למטה
        transposeDownButton.className = "transpose-button down";

        // הוספת כפתורי הטרנספוזיציה
        const transposeButtonContainer = document.createElement("div");
        transposeButtonContainer.className = "transpose-button-container";
        transposeButtonContainer.appendChild(transposeUpButton);
        transposeButtonContainer.appendChild(transposeDownButton);

        // like number
        const likesCount = document.createElement('span');
        likesCount.textContent = `${doc.likesCount}`;
        likesCount.className = "likes-count"

        // like btn
        const likeButton = document.createElement("button");
        likeButton.className = "action-button like-button";
        likeButton.innerHTML = `<i class="far fa-heart" style="color: gray;"></i>`; // לב ריק
        likeButton.onclick = async () => {
            handleLike(doc.id, likeButton, likesCount);
        };

        const likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
        if (likedSongs.includes(doc.id)) {
            likeButton.innerHTML = `<i class="fas fa-heart" style="color: red;"></i>`
        }


        const editButton = document.createElement("button");
        editButton.className = "action-button edit-button";
        editButton.innerHTML = '<i class="fas fa-edit"></i>'; // אייקון עריכה
        editButton.onclick = () => editDocument(doc); // קריאה לפונקציה לעריכת המסמך


        // כפתור הדפסה
        const printButton = document.createElement("button");
        printButton.className = "action-button print-button";
        printButton.textContent = "הדפסה/הורדה";
        printButton.onclick = () => {
            const printWindow = window.open("", "_blank");
            printWindow.document.write(`
 <html>
        <head>
            <title>הדפסת שיר</title>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; line-height: 2em; white-space: pre-wrap; }
                .word { display: inline-block; margin: 0 5px; position: relative; }
                .chords-container { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px; }
                .chord { font-size: 0.9em; font-weight: bold; color: #007bff; white-space: nowrap; }
                .line-break { display: block; margin-bottom: 15px; }
                 h1 { text-align: center; color: #ff4500; }
            </style>
        </head>
        <h1>${doc.name}</h1>
        <body>${doc.content}</body>
    </html>
`);
            printWindow.document.close();
            printWindow.print();
        };

        // כפתור מחיקה
        const deleteButton = document.createElement("button");
        deleteButton.className = "action-button delete-button";
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>'
        deleteButton.onclick = () => DeleteDocument(doc);

        // ריכוז כפתורים
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";

        buttonContainer.appendChild(printButton);
        // buttonContainer.appendChild(deleteButton);
        title.appendChild(deleteButton);
        buttonContainer.appendChild(likeButton);
        buttonContainer.appendChild(likesCount);
        // buttonContainer.appendChild(editButton); // הוספת כפתור עריכה
        title.appendChild(editButton);

        // הוספת כפתורי טרנספוזיציה לכרטיס
        card.appendChild(title);
        card.appendChild(date);
        card.appendChild(content);
        card.appendChild(transposeButtonContainer);
        card.appendChild(buttonContainer);
        container.appendChild(card);
    });
}
function editDocument(doc) {
    let password;
    // alert(`עריכת מסמך: ${doc.name}`);
    Swal.fire({
        title: 'מוכנים לערוך? הזן את הסיסמה שלך 👇',
        input: 'password',
        inputPlaceholder: 'הכנס את הסיסמה שהזנת בעת שמירת השיר',
        showCancelButton: true,
        confirmButtonText: 'בטוח רוצה לערוך!',
        cancelButtonText: 'התחרטתי',
        background: '#2c3e50',
        color: '#fff',
        confirmButtonColor: '#f1c40f',
        cancelButtonColor: '#33d2ca',
        customClass: {
            popup: 'rtl-swal', // specific CSS 
        },
    }).then(async (result) => {//If we click OK - the password is checked and the document is deleted.
        if (result.isConfirmed) {
            password = result.value;
            const isCorrect = await checkUser(doc, password);

            if (isCorrect) {
                // alert('correct');
                sessionStorage.setItem("songContent", doc.content);
                sessionStorage.setItem("title", doc.name);
                sessionStorage.setItem("edit", "true");
                sessionStorage.setItem("p", password);
                sessionStorage.setItem("id", doc.id);

                window.saveUrl('./create/create.html');

                let url = window.location.href;
                url = url.replace("list/list.html", "create/create.html");
                location.replace(url);

            } else {//If occured any error in the deleting
                Swal.fire({
                    icon: 'error',
                    title: 'איזה יוזמה, הא?',
                    text: 'נחמד שניסית לערוך, אבל זה לא המסמך שלך, אז... ביי!',
                    // title: 'באמת חשבת שזה יעבוד?',
                    // text: 'מה לעשות... אין לך הרשאות פה. תתקדם הלאה.',
                    background: '#2c3e50',
                    color: '#fff',
                    confirmButtonColor: '#f1c40f',
                    cancelButtonColor: '#33d2ca',
                    customClass: {
                        popup: 'rtl-swal', // specific CSS 
                    },
                });
            }
        } else {//If Cancel is clicked - a message about canceling the edition
            Swal.fire({
                icon: 'info',
                title: 'התחרטת על העריכה',
                confirmButtonText: 'השיר נשאר כמו שהוא!',
                background: '#2c3e50',
                color: '#fff',
                confirmButtonColor: '#f1c40f',
                cancelButtonColor: '#33d2ca',
                customClass: {
                    popup: 'rtl-swal', // specific CSS 
                },
            });
        }
    });
}


//Check user password
async function checkUser(doc, password) {
    const url = `${basicUrl}/api/documents/checkUser/${doc.id}`; // URL עם פרמטר ה-ID
    try {
        const response = await fetch(url, {
            method: 'POST', // שיטת הבקשה POST
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password })
        });

        if (response.ok) {
            const data = await response.json();
            return true;
        } else if (response.status === 401) {
            return false;
        } else if (response.status === 404) {
            return false;
        } else {
            return false;
        }
    } catch (error) {

    }
}


//delete document from list after password enering
function DeleteDocument(doc) {
    Swal.fire({
        title: 'מוכנים למחוק? הזן את הסיסמה שלך 👇',
        input: 'password',
        inputPlaceholder: 'הכנס את הסיסמה שהזנת בעת שמירת השיר',
        showCancelButton: true,
        confirmButtonText: 'אשר מחיקה',
        cancelButtonText: 'בטל',
        background: '#2c3e50',
        color: '#fff',
        confirmButtonColor: '#f1c40f',
        cancelButtonColor: '#33d2ca',
        customClass: {
            popup: 'rtl-swal', // specific CSS 
        },
    }).then((result) => {//If we click OK - the password is checked and the document is deleted.
        if (result.isConfirmed) {
            const password = result.value; // Getting a password from user input
            const url = `${basicUrl}/api/documents/${doc.id}/${password}`;
            fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(doc),
            })
                .then(response => {
                    if (response.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'נמחק בהצלחה! 🗑️',
                            background: '#2c3e50',
                            color: '#fff',
                            confirmButtonColor: '#f1c40f',
                            cancelButtonColor: '#33d2ca',
                            customClass: {
                                popup: 'rtl-swal', // specific CSS 
                            },

                        }).then(() => location.reload());
                    } else {//If occured any error in the deleting
                        return response.json().then(err => {
                            Swal.fire({
                                icon: 'error',
                                title: 'שגיאה',
                                text: err.message,
                                background: '#2c3e50',
                                color: '#fff',
                                confirmButtonColor: '#f1c40f',
                                cancelButtonColor: '#33d2ca',
                                customClass: {
                                    popup: 'rtl-swal', // specific CSS 
                                },
                            });
                        });
                    }
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'שגיאה בשרת',
                        text: error.message,
                        background: '#2c3e50',
                        color: '#fff',
                        confirmButtonColor: '#f1c40f',
                        cancelButtonColor: '#33d2ca',
                        customClass: {
                            popup: 'rtl-swal', // specific CSS 
                        },
                    });
                });
        } else {//If Cancel is clicked - a message about canceling the deletion
            Swal.fire({
                icon: 'info',
                title: 'הצלת את השיר! 💿',
                confirmButtonText: 'איזה מזל, הא? 😅',
                background: '#2c3e50',
                color: '#fff',
                confirmButtonColor: '#f1c40f',
                cancelButtonColor: '#33d2ca',
                customClass: {
                    popup: 'rtl-swal', // specific CSS 
                },
            });
        }
    });
}

// message animation
function showNotification(message) {

    const container = document.getElementById("alert");
    const notificationContainer = document.createElement("div");
    notificationContainer.textContent = message;
    notificationContainer.className = "notification";

    container.appendChild(notificationContainer);

    setTimeout(() => {
        notificationContainer.classList.add("show");
    }, 100); //Adding a small delay to create an animation

    setTimeout(() => {
        notificationContainer.classList.remove("show");
        setTimeout(() => container.removeChild(notificationContainer), 300);
    }, 1000);
}

// The function responsible for liking/unliking
async function handleLike(docId, button, likesCount) {
    const likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
    try {
        const isLiked = likedSongs.includes(docId);
        //Sending the request to the server
        const response = await fetch(`${basicUrl}/api/documents/${docId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ like: !isLiked })
        });

        if (response.ok) {
            const data = await response.json(); // Get the response content
            const updatedLikesCount = data.doc.likesCount;
            if (isLiked) {//removed like
                const index = likedSongs.indexOf(docId);
                if (index > -1) likedSongs.splice(index, 1);
                button.innerHTML = `<i class="far fa-heart" style="color: grey;"></i>`;
                showNotification("הלייק בוטל 💔");
            } else {//like adding
                likedSongs.push(docId);
                button.innerHTML = `<i class="fas fa-heart" style="color: red;"></i>`;
                showNotification("אהבת? אנחנו גם! ⭐");
            }
            likesCount.textContent = `${updatedLikesCount}`;
            localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
        } else {
            showNotification("אירעה שגיאה, נסה שוב.");
        }
    } catch (error) {
        showNotification("אירעה שגיאה, נסה שוב.");
    }
}


//Filter songs by search input
function filterSongs() {
    const searchTerm = document.getElementById("search-bar").value.toLowerCase();
    const filteredDocuments = allDocuments.filter(doc =>//filter the songs by name/content
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.content.toLowerCase().includes(searchTerm)
    );
    displayDocuments(filteredDocuments);
}

let allDocuments = []; // Global variable to keep the documents
//Get the document from the server
async function fetchDocuments() {
    try {
        const response = await fetch(`${basicUrl}/api/documents`);
        if(!response.ok)
            window.location.reload();
        allDocuments = await response.json();
        if (!allDocuments)
            window.location.reload();
        displayDocuments(allDocuments);
    } catch (error) {
        if (!allDocuments) {
            window.location.reload();
            console.log('error on get documents');
            
        }

    }
}


function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateScrollButtons();
}

function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    updateScrollButtons();
}

function updateScrollButtons() {
    const scrollUpButton = document.getElementById('scroll-up');
    const scrollDownButton = document.getElementById('scroll-down');

    if (window.scrollY > 0) {
        scrollUpButton.style.display = 'block';
    } else {
        scrollUpButton.style.display = 'none';
    }

    if (window.scrollY < document.body.scrollHeight - window.innerHeight) {
        scrollDownButton.style.display = 'block';
    } else {
        scrollDownButton.style.display = 'none';
    }
}

window.addEventListener('scroll', updateScrollButtons);

// Update the buttons scroll in refresh
updateScrollButtons();





function transposeSongContent(content, steps, id, doc) {
    // הפונקציה משנה את האקורדים בתוכן המסמך
    const regex = /([A-G]#?m?7?)([^A-G#]+)/g;
    content = content.replace(regex, (match, chord, rest) => {
        return transposeChord(chord, steps) + rest;
    });

    const idContent = document.getElementById(id);
    idContent.innerHTML = content
    doc.content = content


    return content;
}



// פונקציה שמבצעת טרנספוזיציה
function transposeChord(chord, steps) {
    const regex = /^([A-G]#?)(.*)$/;
    const match = chord.match(regex);

    if (!match) return chord;
    const base = match[1];
    const modifier = match[2];
    const baseChords = [
        "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"
    ];

    const index = baseChords.findIndex(ch => ch === base);
    if (index === -1) return chord;

    const newIndex = (index + steps + baseChords.length) % baseChords.length;
    const newBase = baseChords[newIndex];
    return newBase + modifier;
}

