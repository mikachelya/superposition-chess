document.querySelectorAll('[append-html]').forEach(link => {
    if (window.location.hostname == 'localhost')    
        link.href += ".html";
    else
        link.href = "/superposition-chess/" + link.href.split("/").at(-1);
});

document.querySelectorAll('home').forEach(link => {
    if (window.location.hostname == "mikachelya.github.io")
        link.href = "/superposition-chess";
});