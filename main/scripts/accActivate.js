document.addEventListener("DOMContentLoaded", function(){
    const username = document.getElementById("username");
    const oldPass = document.getElementById("oldPass");
    const newPass = document.getElementById("newPass");

    username.addEventListener("invalid", function(){
        username.setCustomValidity("用户名不能为空");
    });

    username.addEventListener("input", function(){
        username.setCustomValidity("");
    });    

    oldPass.addEventListener("invalid", ()=>{
        oldPass.setCustomValidity("密码不能为空");
    });    

    oldPass.addEventListener("input", ()=>{
        oldPass.setCustomValidity("");
    });

    newPass.addEventListener("invalid", ()=>{
        newPass.setCustomValidity("密码不能为空");
    });

    newPass.addEventListener("input", ()=>{
        newPass.setCustomValidity("");
    });

    document.getElementById("activateForm").addEventListener("submit", async(e)=>{
        e.preventDefault();

        const data = {
            userId: document.getElementById("username").value,
            oldPass: document.getElementById("oldPass").value,
            newPass: document.getElementById("newPass").value
        };

        const res = await fetch("/api/userActivate",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        });

        const result = await res.json();
        alert(result.message);
    });

});