document.querySelectorAll('[append-html]').forEach(link => {
    if (window.location.hostname == 'localhost')    
        link.href += ".html";
    else
        link.href = "/superposition-chess/" + link.href.split("/").at(-1);
});


document.querySelectorAll('[home]').forEach(link => {
    if (window.location.hostname == "mikachelya.github.io")
        link.href = "/superposition-chess";
});


function cancelButton(window) {
    window.style.opacity = 0;
    setTimeout(_ => window.style.display = "none", 300);
}


function activateWindow(window) {
    window.style.display = "block";
    setTimeout(_ => window.style.opacity = 1, 1000 / frameRate());
}


function toggleWindow(window) {
    if (window.style.display == "" || window.style.display == "none")
        return activateWindow(window);
    cancelButton(window);
}