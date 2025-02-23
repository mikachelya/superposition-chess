document.querySelectorAll('[append-html]').forEach(link => {
    if (window.location.hostname == 'localhost')
        link.href += ".html";
});