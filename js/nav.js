document.querySelectorAll('[append-html]').forEach(link => {
    if (window.location.hostname == 'localhost')    
        link.href += ".html";
    else
        link.href = "/superposition-chess/" + link.href.split("/").at(-1);
});