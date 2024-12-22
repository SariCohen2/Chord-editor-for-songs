
window.basicURL= 'http://localhost:3000';

window.applyDarkMode = function () {//Check the current mode
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', isDarkMode);
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (toggleButton) {
        toggleButton.textContent = isDarkMode ? 'מצב רגיל' : 'מצב כהה';
    }
}

window.toggleDarkMode = function () {//cross between the modes
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    const toggleButton = document.getElementById('dark-mode-toggle');
    toggleButton.textContent = isDarkMode ? 'מצב רגיל' : 'מצב כהה';
}

//Global function for save current url 
window.saveUrl = function (url) {
    sessionStorage.setItem('url', url)
}

//Global function for load general details
window.onload = function () {
    applyDarkMode();
    const url = sessionStorage.getItem('url')
    if (url) {
        const iframe = document.querySelector('iframe[name="content"]');
        iframe.src = url;
    }
};



