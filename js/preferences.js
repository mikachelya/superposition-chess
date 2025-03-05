let optionName = "moveMethod"
// Load saved state from localStorage, default to "drag" if nothing is saved
const savedOption = localStorage.getItem(optionName) || "both";
document.querySelector(`input[value="${savedOption}"]`).checked = true;

// Add event listeners to radio buttons
const radioButtons = document.querySelectorAll('input[type="radio"]');
radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        localStorage.setItem(optionName, selectedValue);
        moveMethod = selectedValue;
    });
});