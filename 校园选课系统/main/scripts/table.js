document.addEventListener("DOMContentLoaded",()=>{
    const userName = document.getElementById("userName");
    const userGet = localStorage.getItem('username');
    
    userName.textContent = userGet ? userGet : "12345678901234567890";
});