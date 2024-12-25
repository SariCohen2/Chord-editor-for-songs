const   basicUrl="https://chords-server.onrender.com";
// const basicUrl = "http://localhost:3000";

window.onload = function () {
    const printBtn = document.getElementById("print-button");
    const saveBtn = document.getElementById("save-button");

    var isFull = loadFromSessionStorage();
    if (isFull) {
        printBtn.className = 'printing_saving';
        saveBtn.className = 'printing_saving';
        printBtn.disabled = false;
        saveBtn.disabled = false;
    }
    applyDarkMode();
};

let selectedWord = null;

// load content from sessionStorage
function loadFromSessionStorage() {
    const storedContent = sessionStorage.getItem("songContent");
    const title = sessionStorage.getItem("title");
    const st = sessionStorage.getItem("songText");
    if (title && st) {
        const input = document.getElementById("song-title");
        input.value = title;
        document.getElementById("song-text").innerHTML = st;
    }
    if (storedContent) {
        const preview = document.getElementById("song-preview");
        preview.innerHTML = storedContent;
        preview.style.paddingTop = '10px';
        preview.style.borderRadius = "15px";
        attachWordClickHandlers();
        return true
    }
}

async function generatePreview() {
    const songText = document.getElementById("song-text").value.trim();
    const preview = document.getElementById("song-preview");
    const songTitle = document.getElementById("song-title").value.trim() || "כותרת שיר";
    sessionStorage.setItem('songText', songText);
    sessionStorage.setItem('title', songTitle);
    preview.innerHTML = "";
    if (!songText) {
        await Swal.fire({
            icon: 'warning',
            title: 'חסר מידע',
            text: 'אין תצוגה בלי מידע. אנא מלא את הכותרת ואת מילות השיר.',
            confirmButtonText: 'אישור',
            background: '#2c3e50',
            color: '#fff',
            confirmButtonColor: '#f1c40f',
            cancelButtonColor: '#33d2ca',
        });
        return;
    }
    const printBtn = document.getElementById("print-button");
    const saveBtn = document.getElementById("save-button");
    printBtn.className = 'printing_saving';
    saveBtn.className = 'printing_saving';
    printBtn.disabled = false;
    saveBtn.disabled = false;

    const lines = songText.split("\n");
    lines.forEach(line => {
        const lineContainer = document.createElement("div");
        lineContainer.className = "line-break";
        const words = line.split(/(\s+)/); // divide to words and spaces
        words.forEach(word => {
            const wordElement = document.createElement("span");
            wordElement.className = "word";
            wordElement.innerText = word.trim();
            const chordsContainer = document.createElement("div");
            chordsContainer.className = "chords-container";
            wordElement.appendChild(chordsContainer);
            wordElement.onclick = () => {
                handleWordClick(wordElement);
            };
            lineContainer.appendChild(wordElement);
        });
        preview.appendChild(lineContainer);
    });
    preview.style.paddingTop = '10px';
    preview.style.borderRadius = "15px";
    saveToSessionStorage(); // save the content in sessionStorage
}

function handleWordClick(wordElement) {
    selectedWord = wordElement;
    const chord = document.getElementById("chord-selector").value;
    if (chord) {
        const chordsContainer = wordElement.querySelector(".chords-container");
        const chordElement = document.createElement("span");
        chordElement.className = "chord";
        chordElement.innerText = chord;
        chordsContainer.appendChild(chordElement);
        saveToSessionStorage(); // update the data in sessionStorage
        const chordSelector=document.getElementById("chord-selector");
        moveChordToTop(chordSelector, chord);//Push the selected chord to the top
        saveChordOrderToSession(chordSelector);

    }
}
function moveChordToTop(chordSelector, chord) {
    const options = Array.from(chordSelector.options);
    const existingOption = options.find(option => option.value === chord);

    if (existingOption) {
        chordSelector.removeChild(existingOption);
        chordSelector.insertBefore(existingOption, chordSelector.options[1]); // למעלה, אחרי "בחר אקורד"
    }
}
function saveChordOrderToSession(chordSelector) {
    // שמירת הסדר החדש של האופציות ב-sessionStorage
    const chordsOrder = Array.from(chordSelector.options).map(option => option.value);
    sessionStorage.setItem('chordOrder', JSON.stringify(chordsOrder));
}
function loadChordOrderFromSession() {
    // שחזור הסדר מה-sessionStorage
    const savedOrder = JSON.parse(sessionStorage.getItem('chordOrder'));
    const chordSelector = document.getElementById("chord-selector");

    if (savedOrder && chordSelector) {
        // יצירת סדר חדש בהתאם לנתונים מה-sessionStorage
        const options = Array.from(chordSelector.options);
        chordSelector.innerHTML = ""; // ניקוי הרשימה הקיימת

        savedOrder.forEach(value => {
            const option = options.find(opt => opt.value === value);
            if (option) {
                chordSelector.appendChild(option);
            }
        });
    }
}
document.addEventListener("DOMContentLoaded", loadChordOrderFromSession);





function saveToSessionStorage() {
    const previewContent = document.getElementById("song-preview").innerHTML;
    sessionStorage.setItem("songContent", previewContent);
}

function deleteChords() {
    if (selectedWord) {
        const chordsContainer = selectedWord.querySelector(".chords-container");
        chordsContainer.innerHTML = ""; // delete all the chords
        selectedWord = null;
        // document.getElementById("delete-chords-button").style.display = "none";
        // document.getElementById("chord-selector-container").style.paddingBottom = "10px";

        saveToSessionStorage(); // update data in sessionStorage
    }
}

let isDeleteMode = false;

function toggleDeleteMode() {
    const deleteButton = document.getElementById("delete-mode-button");
    isDeleteMode = !isDeleteMode;

    if (isDeleteMode) {
        deleteButton.classList.add("active");
        Array.from(document.getElementsByClassName('chords-container')).forEach(element => {
            element.classList.add('delete-cursor');
          });
          Array.from(document.getElementsByClassName('word')).forEach(element => {
            element.style.cursor='no-drop';
          });
          

        document.getElementById('delete-mode-button').innerHTML = `<i class="fas fa-pen"></i>
<span>ביטול מצב מחיקה</span>`;
        document.addEventListener("click", deleteChordsOnWord);
    } else {
        deleteButton.classList.remove("active");
        //remove delete-cursor from chords
        Array.from(document.getElementsByClassName('chords-container')).forEach(element => {
            element.classList.remove('delete-cursor');
          });
          Array.from(document.getElementsByClassName('word')).forEach(element => {
            element.style.cursor='pointer';
          });
        document.getElementById('delete-mode-button').innerHTML=`<i class="fas fa-eraser"></i>
        <span>מצב מחיקה</span>`;
        document.removeEventListener("click", deleteChordsOnWord);
    }
      const selectElement = document.getElementById('chord-selector');
      if (selectElement) {
          selectElement.blur();
          selectElement.value = "";  

      }
}

function deleteChordsOnWord(event) {
    if (isDeleteMode) {
        const target = event.target;

        if (target.tagName === "SPAN" && target.classList.contains('chord')) {
            target.remove()
        }
        // console.log(target);

        // if (target.tagName === "SPAN" && target.classList.contains("word")) {
        //     const chordsAbove = target.previousElementSibling;
        //     console.log(chordsAbove);

        //     if (chordsAbove && chordsAbove.classList.contains("chord")) {
        //         chordsAbove.remove(); // מחיקת האקורדים
        //     }
        // }
        saveToSessionStorage()
    }
}

//tooltip above the delte button
document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
function attachWordClickHandlers() {
    const words = document.querySelectorAll("#song-preview .word");
    words.forEach(wordElement => {
        wordElement.onclick = () => {
            handleWordClick(wordElement);
        };
    });
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
    //כדי שלא ישמר עם כל הסטייל של מצב מחיקה
    if(isDeleteMode)
        toggleDeleteMode();
    const title = document.getElementById("song-title").value.trim();
    const previewContent = document.getElementById("song-preview").innerHTML;
    const date = new Date().toISOString(); // current date in ISO format
    const { value: password } = await Swal.fire({
        title: 'בוא נעבור לשמירה!',
        input: 'password',
        inputPlaceholder: 'הכנס את הסיסמה - היא תהיה הכלי שלך אם תרצה להסיר את השיר. 💬',
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
            title: 'משהו חסר...',
            text: 'אל תשכח למלא את הכותרת, המילים והסיסמה לפני השמירה. 🖋️',
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
        title: 'לשמור או לא לשמור?',
        text: 'זאת השאלה. מחכה לתשובתך. 🤔',
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
            title: 'אין בעיה!',
            text: ' השמירה בוטלה בהצלחה, פשוט וקל. ✅',
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
                title: 'הצלחנו!',
                text: ' השיר נשמר, בדיוק כמו שתכננת. 😉',
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
        }
    } catch (error) {
        await Swal.fire({
            icon: 'error',
            title: 'אירעה שגיאה',
            text: error.message || 'שגיאה לא ידועה התרחשה.',
            confirmButtonText: 'אישור',
            customClass: {
                popup: 'rtl-swal', //specific  CSS 
            },
        });
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
// start drag
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

function toggleTips() {
    const tipsContainer = document.getElementById('tips-container');
    tipsContainer.style.display = tipsContainer.style.display === 'block' ? 'none' : 'block';
}


// פונקציה לגלילה לתחילת הדף
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateScrollButtons(); // עדכון כפתורים לאחר הגלילה
}

// פונקציה לגלילה לתחתית הדף
function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    updateScrollButtons(); // עדכון כפתורים לאחר הגלילה
}

// פונקציה לעדכון כפתורי הגלילה
function updateScrollButtons() {
    const scrollUpButton = document.getElementById('scroll-up');
    const scrollDownButton = document.getElementById('scroll-down');

    // אם הגולל לא נמצא למעלה, הצג את כפתור העליון
    if (window.scrollY > 0) {
        scrollUpButton.style.display = 'block';
    } else {
        scrollUpButton.style.display = 'none';
    }

    // אם הגולל לא נמצא בתחתית, הצג את כפתור התחתון
    if (window.scrollY < document.body.scrollHeight - window.innerHeight) {
        scrollDownButton.style.display = 'block';
    } else {
        scrollDownButton.style.display = 'none';
    }
}

// הקשב לאירוע גלילה (scroll) לעדכון כפתורים
window.addEventListener('scroll', updateScrollButtons);

//Update in each refresh
updateScrollButtons();
