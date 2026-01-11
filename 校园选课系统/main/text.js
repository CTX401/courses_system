
        table.addEventListener("contextmenu", function(f){
            f.preventDefault();
            
            const td = f.target.closest("td");
            if (!td) return;

            const oldValue = td.innerText;
            const input = document.createElement("input");
            input.type = "text";
            input.value = oldValue;
            input.style.width = td.offsetWidth;

            td.innerText = "";
            td.appendChild(input);
            input.focus();

            function save(){
                td.innerText = input.value;
                edited = true;
                input.removeEventListener("blur", save);
                input.removeEventListener("keydown", onKeyDown);
            }

            function onKeyDown(event) {
                if(event.key === "Enter"){
                    save();
                }else if(event.key === "Escape"){
                    td.innerText = oldValue;
                }
            }

            input.addEventListener("blur", save);
            input.addEventListener("keydown", onKeyDown);
        });

                     const res = await fetch("/api/dltUser", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({id: userId})  // 建议传对象
                    });