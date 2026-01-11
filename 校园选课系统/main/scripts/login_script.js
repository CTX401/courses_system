document.addEventListener("DOMContentLoaded", function(){
    const inputName = document.getElementById("username");
    const inputPass = document.getElementById("password_input");
    const submitBtn = document.getElementById("submit");

    inputName.addEventListener("invalid", function(){
        inputName.setCustomValidity("用户名不能为空");
    });

    inputName.addEventListener("input", function(){
        inputName.setCustomValidity("");   
    });

    inputPass.addEventListener("invalid", function(){
        inputPass.setCustomValidity("密码不能为空");
    });

    inputPass.addEventListener("input", function(){
        inputPass.setCustomValidity("");
    });

    inputName.addEventListener("keydown", (userEnter) => {
        if(userEnter.key === "enter") submitBtn.click();
    });

    inputPass.addEventListener("keydown", (passEnter) => {
        if(passEnter.key === "enter") submitBtn.click();
    }); 
})

function showPassword(){
    var password_text_type = document.getElementById("password_input");
    if(password_text_type.type == "password"){
        password_text_type.type = "text";
    }
    else{
        password_text_type.type = "password";
    }
}
