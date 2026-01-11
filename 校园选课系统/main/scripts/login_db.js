document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", function(e){
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            user: formData.get("user"),
            password: formData.get("password")
        };
        fetch("/submit",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(res => {
            if(res.success){
                sessionStorage.setItem("username", res.username);
                sessionStorage.setItem("ID", data.user);
                window.location.href = res.redirect;                
            }else{
                alert(res.message);
            }
        });
    });
});


