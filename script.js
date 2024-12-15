
const   basicUrl="https://chords-server.onrender.com";
// const basicUrl = "http://localhost:3000";

//index.html logic:
function applyDarkMode() {//Check the current mode
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDarkMode);
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (toggleButton) {
        toggleButton.textContent = isDarkMode ? 'מצב רגיל' : 'מצב כהה';
    }
}

function toggleDarkMode() {//cross between the modes
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    const toggleButton = document.getElementById('dark-mode-toggle');
    toggleButton.textContent = isDarkMode ? 'מצב רגיל' : 'מצב כהה';
}


window.onload = function () {
    // Fetch documents if on the chord-list page
    if (window.location.pathname.includes("chord-list")) {
        fetchDocuments();
    }
    applyDarkMode();
    fetchDocuments();
};










// chord-list.html logic
function displayDocuments(documents) {
    const container = document.getElementById("documents-container");
    container.innerHTML = ""; // מנקה את התוכן הקודם

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

        const printButton = document.createElement("button"); // Print button
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

        const deleteButton = document.createElement("button");
        deleteButton.className = "action-button delete-button";
        // deleteButton.textContent = "מחיקה";
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>'
        deleteButton.onclick = () => DeleteDocument(doc);

        // const editButton = document.createElement("button");
        // editButton.className = "action-button edit-button";
        // editButton.textContent = "עריכה";
        // editButton.onclick = () => handleAction("edit", doc);

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";
        buttonContainer.appendChild(printButton);
        // buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);

        card.appendChild(title);
        card.appendChild(date);
        card.appendChild(content);
        card.appendChild(buttonContainer);

        container.appendChild(card);
    });
}
function DeleteDocument(doc) {
    Swal.fire({
        title: 'הכנס סיסמה',
        input: 'password',
        inputPlaceholder: 'הכנס את הסיסמה שהזנת בעת שמירת השיר',
        showCancelButton: true,
        confirmButtonText: 'שלח',
        cancelButtonText: 'בטל',
        background: '#2c3e50',
        color: '#fff',
        confirmButtonColor: '#f1c40f',
        cancelButtonColor: '#33d2ca',
    }).then((result) => {
        if (result.isConfirmed) {
            const password = result.value; // קבלת הסיסמה מהקלט
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
                            title: 'הפעולה הושלמה בהצלחה',
                            background: '#2c3e50',
                            color: '#fff',
                            confirmButtonColor: '#f1c40f',
                            cancelButtonColor: '#33d2ca',
                            
                        }).then(() => location.reload());
                    } else {
                        return response.json().then(err => {
                            Swal.fire({
                                icon: 'error',
                                title: 'שגיאה',
                                text: err.message,
                                background: '#2c3e50',
                                color: '#fff',
                                confirmButtonColor: '#f1c40f',
                                cancelButtonColor: '#33d2ca',
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
                    });
                });
        } else {
            Swal.fire({
                icon: 'info',
                title: 'הפעולה בוטלה',
                background: '#2c3e50',
                color: '#fff',
                confirmButtonColor: '#f1c40f',
                cancelButtonColor: '#33d2ca',
            });
        }
    });
}


function filterSongs() {
    const searchTerm = document.getElementById("search-bar").value.toLowerCase();

    const filteredDocuments = allDocuments.filter(doc =>//filter the songs by name/content
        doc.name.toLowerCase().includes(searchTerm) ||
        doc.content.toLowerCase().includes(searchTerm)
    );

    displayDocuments(filteredDocuments);
}



let allDocuments = []; // Global variable to keep the documents

async function fetchDocuments() {
    try {
        const response = await fetch(`${basicUrl}/api/documents`);
        allDocuments = await response.json();

        displayDocuments(allDocuments);
    } catch (error) {
        console.error("שגיאה בטעינת המסמכים:", error);
    }
}





//chord-edit.html logic:
let selectedWord = null;

async function generatePreview() {
    const songText = document.getElementById("song-text").value.trim();
    const preview = document.getElementById("song-preview");
    preview.innerHTML = "";

    if (!songText) {
        await Swal.fire({
            icon: 'warning',
            title: 'חסר מידע',
            text: 'אנא מלא את הכותרת ואת מילות השיר לפני התצוגה.',
            confirmButtonText: 'אישור',
            background: '#2c3e50',
            color: '#fff',
            confirmButtonColor: '#f1c40f',
            cancelButtonColor: '#33d2ca',
        });
        return;
    }
    document.getElementById("print-button").disabled = false;
    document.getElementById("save-button").disabled = false;

    const lines = songText.split("\n");
    lines.forEach(line => {
        const lineContainer = document.createElement("div");
        lineContainer.className = "line-break";

        const words = line.split(/(\s+)/); // חלוקה למילים ורווחים
        words.forEach(word => {
            const wordElement = document.createElement("span");
            wordElement.className = "word";
            wordElement.innerText = word.trim();

            const chordsContainer = document.createElement("div");
            chordsContainer.className = "chords-container";
            wordElement.appendChild(chordsContainer);

            wordElement.onclick = () => {
                selectedWord = wordElement;
                document.getElementById("delete-chords-button").style.display = "block";
                const chord = document.getElementById("chord-selector").value;

                if (chord) {
                    const chordElement = document.createElement("span");
                    chordElement.className = "chord";
                    chordElement.innerText = chord;
                    chordsContainer.appendChild(chordElement);
                }
            };

            lineContainer.appendChild(wordElement);
        });

        preview.appendChild(lineContainer);

    });
    preview.style.paddingTop = '10px'
    preview.style.borderRadius = "15px"
}

function deleteChords() {
    if (selectedWord) {
        const chordsContainer = selectedWord.querySelector(".chords-container");
        chordsContainer.innerHTML = ""; // מוחק את כל האקורדים
        selectedWord = null;
        document.getElementById("delete-chords-button").style.display = "none";
    }
}

function printSong() {
    const songTitle = document.getElementById("song-title").value.trim() || "כותרת שיר";
    const printContent = document.getElementById("song-preview").outerHTML;
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
                        <h1>${songTitle}</h1>
                        <body>${printContent}</body>
                    </html>
                `);

    printWindow.document.close();
    printWindow.print();
}


async function saveToDB() {
    const title = document.getElementById("song-title").value.trim();
    const previewContent = document.getElementById("song-preview").innerHTML;
    const date = new Date().toISOString(); // התאריך הנוכחי בפורמט ISO

    const { value: password } = await Swal.fire({
        title: 'הכנס סיסמה',
        input: 'password',
        inputPlaceholder: 'הכנס את הסיסמה שלך- תשמש אותך במקרה ותרצה למחוק את השיר',
        showCancelButton: true,
        confirmButtonText: 'אישור',
        cancelButtonText: 'ביטול',
        background: '#2c3e50',
        color: '#fff',
        confirmButtonColor: '#f1c40f',
        cancelButtonColor: '#33d2ca',
    });

    if (!title || !previewContent || !password) {
        await Swal.fire({
            icon: 'warning',
            title: 'חסר מידע',
            text: 'אנא מלא את הכותרת ,את מילות השיר וסיסמא לפני השמירה.',
            confirmButtonText: 'אישור',
            background: '#2c3e50',
            color: '#fff',
            confirmButtonColor: '#f1c40f',
            cancelButtonColor: '#33d2ca',
        });
        return;
    }

    const confirmSave = await Swal.fire({
        icon: 'question',
        title: 'אישור שמירה',
        text: 'האם אתה בטוח שברצונך לשמור את השיר באתר?',
        showCancelButton: true,
        confirmButtonText: 'כן, שמור',
        cancelButtonText: 'ביטול',
        background: '#2c3e50',
        color: '#fff',
        confirmButtonColor: '#f1c40f',
        cancelButtonColor: '#33d2ca',
    });

    if (!confirmSave.isConfirmed) {
        await Swal.fire({
            icon: 'info',
            title: 'השמירה בוטלה',
            text: 'השמירה בוטלה בהצלחה.',
            confirmButtonText: 'אישור',
            background: '#2c3e50',
            color: '#fff',
            confirmButtonColor: '#f1c40f',
            cancelButtonColor: '#33d2ca',
        });
        return;
    }

    const payload = {
        name: title,
        content: previewContent,
        createdAt: date,
        password: password
    };

    try {
        const response = await fetch(`${basicUrl}/api/documents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok) {
            await Swal.fire({
                icon: 'success',
                title: 'השמירה הצליחה!',
                text: 'השיר נשמר בהצלחה באתר.',
                confirmButtonText: 'מעולה',
                background: '#2c3e50',
                color: '#fff',
                confirmButtonColor: '#f1c40f',
                cancelButtonColor: '#33d2ca',
            });
        } else {
            await Swal.fire({
                icon: 'error',
                title: 'שגיאה בשמירה',
                text: result.message || 'שגיאה לא ידועה התרחשה.',
                confirmButtonText: 'נסה שוב',
                background: '#2c3e50',
                color: '#fff',
                confirmButtonColor: '#f1c40f',
                cancelButtonColor: '#33d2ca',
            });
            console.log('error=====', result.message);
        }
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'אירעה שגיאה',
            text: error.message || 'שגיאה לא ידועה התרחשה.',
            confirmButtonText: 'אישור'
        });
        console.log('error=====', error.message);
    }
}

$(document).ready(function () {
    $('#chord-selector').select2({
        placeholder: 'בחר אקורד',
        allowClear: true,
    });
});
let isDragging = false;
let offsetX, offsetY;

const selectElement = document.getElementById('chord-selector-container');

// start dras
selectElement.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - selectElement.offsetLeft;
    offsetY = e.clientY - selectElement.offsetTop;
});

// stop drag
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const newX = e.clientX - offsetX;
    const newY = e.clientY - offsetY;

    selectElement.style.left = `${newX}px`;
    selectElement.style.top = `${newY}px`;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});