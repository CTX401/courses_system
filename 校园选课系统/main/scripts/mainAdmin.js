document.addEventListener("DOMContentLoaded",()=>{
    const userName = document.getElementById("userName");
    const userGet = localStorage.getItem('username');

    userName.textContent = userGet ? userGet : "123456789";

    // 座面切换
    const buttons = document.querySelectorAll(".button");
    const tables = document.querySelectorAll("table");
    
    buttons.forEach(button => {
        button.addEventListener('click', () =>{
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tables.forEach(tbl => tbl.classList.add("hidden"));

            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');

        });
    });

    fetch("/api/adminStudentData")
    .then(resStd => resStd.json())
    .then(data => {
        if(data.success){
            const tableBody = document.getElementById("students");
            data.data.forEach(row =>{
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td align="center">${row.num}</td>
                    <td>${row.name}</td>
                    <td>${row.id}</td>
                    <td align="center">${row.gender}</td>
                    <td>${row.academy}</td>
                    <td>${row.class}</td>
                    <td>${row.phone_number}</td>
                    <td>${row.email}</td>
                    <td>${row.degree}</td>
                    <td align="center"><button  class='dltBtn'> X </button></td>`;
                tableBody.appendChild(tr);
            });
        }else{
            alert("数据加载失败");
        }
    }).catch(err => console.error(err));

    fetch("/api/adminTeacherData")
    .then(resStd => resStd.json())
    .then(data => {
        if(data.success){
            const tableBody = document.getElementById("teachers");
            data.data.forEach(row =>{
                const tr = document.createElement("tr");
                if(row.email == null){
                    row.email = '-';
                }
                if(row.contact == null){
                    row.contact = '-';
                }
                tr.innerHTML = `
                    <td align="center">${row.num}</td>
                    <td>${row.name}</td>
                    <td>${row.id}</td>
                    <td align="center">${row.gender}</td>
                    <td>${row.title}</td>
                    <td>${row.department}</td>
                    <td>${row.email}</td>
                    <td>${row.contact}</td>
                    <td align="center"><button class='dltBtn'> X </button></td>`;
                tableBody.appendChild(tr);
            });
        }else{
            alert("数据加载失败");
        }
    }).catch(err => console.error(err));

    ["students", "teachers"].forEach(tableId => {
        const table = document.getElementById(tableId);
        
        // 删除用户
        table.addEventListener("click", function(e){
            if(e.target && e.target.classList.contains("dltBtn")){
                e.preventDefault();

                const row = e.target.closest("tr");
                const name = row.cells[1].innerText;
                const userId = row.cells[2].innerText;

                if(confirm(`是否删除用户 ${name} (${userId}) ?`)){
                    const res =  fetch("/api/dltUser", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({id: userId})  // 建议传对象
                    });
                    const result = res.json();
                    alert(result.message);
                    if(result.success){row.remove()} // 删除行
                }
            }
        });                
    });

    const tableStd = document.getElementById("students");
    const tableTch = document.getElementById("teachers");

    tableStd.addEventListener("contextmenu", function(std){
        std.preventDefault();
        console.log("hi");
        const stdHeaders = Array.from(tableStd.tHead.row[0].cells).map(th => th.innerText);
        const row = std.target.closest("tr");
        if(!row) return;
        const td = std.target.closest("td");
        if(!td) return;
        if(td.cellIndex === 0) return;

        const rowList = Array.from(row.cells).map(cell => cell.innerText);

        const oldValue = td.innerText;
        const input = document.createElement("input");
        input.type = "text";
        input.value = oldValue;
        input.style.width = td.offsetWidth;

        td.innerText = "";
        td.appendChild(input);
        input.focus();

        async function save(){
            const editSql = `UPDATE student_info SET ${stdHeaders[td.cellIndex]} = ${input.value} WHERE 
                            ${stdHeaders[0]} = ${rowList[0]},
                            ${stdHeaders[1]} = ${rowList[1]},
                            ${stdHeaders[2]} = ${rowList[2]},
                            ${stdHeaders[3]} = ${rowList[3]},
                            ${stdHeaders[4]} = ${rowList[4]},
                            ${stdHeaders[5]} = ${rowList[5]},
                            ${stdHeaders[6]} = ${rowList[6]},
                            ${stdHeaders[7]} = ${rowList[7]},
                            ${stdHeaders[8]} = ${rowList[8]}`;
            
            const res = await fetch("/api/editUser", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(editSql)
            });

            const result = await res.json();
            if(result.success === false){
                td.innerText = oldValue;
                return alert(result.message);
            }
            td.innerText = input.value;
            input.removeEventListener("blur", blur);
            input.removeEventListener("keydown", onKeyDown);            
        }

        function onKeyDown(event) {
            if(event.key === "Enter"){
                save();
            }else if(event.key === "Escape"){
                td.innerText = oldValue;
            }
        }

        function blur(){
            td.innerText = oldValue;
        }

        input.addEventListener("blur", blur);
        input.addEventListener("keydown", onKeyDown);
    });
});
