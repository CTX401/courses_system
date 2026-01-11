document.addEventListener("DOMContentLoaded",()=>{
    const userName = document.getElementById("userName");
    const userGet = sessionStorage.getItem('username');

    userName.textContent = userGet ? userGet : "123456789";

    // 座面切换
    const buttons = document.querySelectorAll(".button");
    const container = document.querySelectorAll(".outer");
    
    window.addEventListener("DOMContentLoaded",()=>{        
        const savedTab = sessionStorage.getItem("activeTab");

        if(savedTab){
            activateTab(savedTab);
        }else{
            const firstTab = buttons[0].getAttribute('data-target');
            activateTab(firstTab);
        }
    });

    function activateTab(targetId){
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute("data-target") === targetId);
        });
        
        container.forEach(tbl => {
            tbl.classList.add("hidden");
        });
        document.getElementById(targetId).classList.remove("hidden");
    }

    buttons.forEach(button => {        
        button.addEventListener('click', () =>{
            searchBarStd.querySelector(".searchStd").value = "";
            searchBarTch.querySelector(".searchTch").value = "";
            searchBarLog.querySelector(".searchLog").value = "";
            getStudentInfo();
            getTeacherInfo();
            getLoginInfo();
            const targetId = button.getAttribute("data-target");
            activateTab(targetId);
            sessionStorage.setItem("activeTab", targetId);
        });
    });

    const dotBtn = document.querySelector(".options");
    const dotMenu = document.querySelector(".dropdown");

    dotBtn.addEventListener("click", (e)=>{
        e.stopPropagation();
        dotMenu.classList.toggle("close");
    });

    document.addEventListener("click", ()=>{
        dotMenu.classList.add("close");
    });

    let clickedS = false;
    let addingS = false;
    let clickedT = false;
    let addingT = false;

    const searchBarStd = document.getElementById("searchbarStd");
    const stdTabBody = document.getElementById("stdTabBody");  
    const searchStdBtn = document.getElementById("startSearchStd");
    getStudentInfo();

    searchStdBtn.addEventListener("click", (sS) => { 
        sS.preventDefault();    
        const searchText = searchBarStd.querySelector(".searchStd").value;            
        if(searchText == ""){
            getStudentInfo();
        }else{
            getStudentInfo(searchText);            
        }
    });

    //获取学生信息
    async function getStudentInfo(search=""){
        fetch(`/api/admin/StudentData?search=${search}`)
        .then(resStd => resStd.json())
        .then(data => {
            if(data.success){
                stdTabBody.innerHTML = "";
                let i = 1;
                data.data.forEach(row =>{                   
                    const tr = document.createElement("tr");
                    if(row.email == null){
                        row.email = '-';
                    }
                    tr.innerHTML = `
                        <td align="center">${i}</td>
                        <td>${row.name}</td>
                        <td>${row.id}</td>
                        <td align="center">${row.gender}</td>
                        <td>${row.academy}</td>
                        <td>${row.class}</td>
                        <td>${row.phone_number}</td>
                        <td>${row.email}</td>
                        <td>${row.degree}</td>
                        <td align="center"><button class='dltBtn'> X </button></td>
                        <td style="display:none;">${row.logIdentifier}</td>`;
                    stdTabBody.appendChild(tr);
                    i++;
                });
                if(i==1){
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td colspan="10">无匹配数据</td>`;
                    stdTabBody.appendChild(tr);
                }
            }else{
                alert("数据加载失败");
            }
        }).catch(err => console.error(err));
    }

    const searchBarTch = document.getElementById("searchbarTch");
    const tchTabBody = document.getElementById("tchTabBody");  
    const searchTchBtn = document.getElementById("startSearchTch");
    getTeacherInfo();

    searchTchBtn.addEventListener("click", (sT) => {
        sT.preventDefault();
        const searchText = searchBarTch.querySelector(".searchTch").value;
        if(searchText == ""){
            getTeacherInfo();
        }else{
            getTeacherInfo(searchText);
        }
    });

    //获取教师信息
    async function getTeacherInfo(search = ""){
        fetch(`/api/admin/TeacherData?search=${search}`)
        .then(resStd => resStd.json())
        .then(data => {
            tchTabBody.innerHTML = "";
            let i = 1;
            if(data.success){
                data.data.forEach(row =>{
                    const tr = document.createElement("tr");
                    if(row.email == null){
                        row.email = '-';
                    }
                    if(row.contact == null){
                        row.contact = '-';
                    }
                    tr.innerHTML = `
                        <td align="center">${i}</td>
                        <td>${row.name}</td>
                        <td>${row.id}</td>
                        <td align="center">${row.gender}</td>
                        <td>${row.title}</td>
                        <td>${row.department}</td>
                        <td>${row.email}</td>
                        <td>${row.contact}</td>
                        <td align="center"><button class='dltBtn'> X </button></td>
                        <td style="display:none;">${row.logIdentifier}</td>`;                    
                    tchTabBody.appendChild(tr);
                    i++;
                });
                if(i==1){
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td colspan="9">无匹配数据</td>`;
                    tchTabBody.appendChild(tr);
                }                
            }else{
                alert("数据加载失败");
            }
        }).catch(err => console.error(err));
    }


    const loginTabBody = document.getElementById("loginTabBody");
    const searchBarLog = document.getElementById("searchbarLog");
    const searchLogBtn = document.getElementById("startSearchLog");   
    getLoginInfo();

    searchLogBtn.addEventListener("click", (sL) => {
        sL.preventDefault();
        const searchText = searchBarLog.querySelector(".searchLog").value;
        if(searchText == ""){
            getLoginInfo();
        }else{
            getLoginInfo(searchText);
        }
    });

    // 获取用户登录信息
    async function getLoginInfo(search = ""){
        fetch(`/api/admin/LoginData?search=${search}`)
        .then(resLog => resLog.json())
        .then(data => {
            if(data.success){
                loginTabBody.innerHTML = "";
                let i = 1;
                data.data.forEach(row => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td align="center">${i}</td>
                        <td>${row.user}</td>
                        <td>${row.id}</td>
                        <td>${row.password}</td>
                        <td>${row.active}</td>
                        <td align="center"><button class='dltBtn'> X </button></td>
                        <td style="display:none;">${row.logIdentifier}</td>`;
                    loginTabBody.appendChild(tr);
                    i++;
                });           
                if(i==1){
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td colspan="6">无匹配数据</td>`;
                    loginTabBody.appendChild(tr);
                }                     
            }else{
                alert("数据加载失败");
            }
        }).catch(err => console.error(err));        
    }


    ["students", "teachers", "login"].forEach(tableId => {
        const table = document.getElementById(tableId);       
        // 删除用户
        table.addEventListener("click", async function(e){
            if(addingS) return;
            if(clickedS) return;
            if(e.target && e.target.classList.contains("dltBtn")){
                e.preventDefault();

                const row = e.target.closest("tr");
                const name = row.cells[1].innerText;
                const userId = row.cells[2].innerText;

                if(confirm(`是否删除用户 ${name} (${userId}) ?`)){
                    const res =  await fetch("/api/dltUser", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({id: userId})  // 建议传对象
                    });
                    const result = await res.json();
                    alert(result.message);
                    if(result.success){
                        location.reload();
                    }

                }
            }
        });                
    });

    const tableStd = document.getElementById("students");
    const tableTch = document.getElementById("teachers");
    const stdHead = ['num','name', 'id', 'gender', 'academy', 'class', 'phone_number', 'email', 'degree'];
    const tchHead = ['num','name', 'id', 'gender', 'title', 'department', 'email', 'contact'];

    //编辑学生信息
    stdTabBody.addEventListener("dblclick", function(std){
        if(clickedS) return;
        if(addingS) return;
        clickedS = true;
        // alert(stdHead);
        std.preventDefault();
        const tr = std.target.closest("tr");
        const trData = Array.from(tr.cells);
        const oldVal = Array.from(tr.cells).slice(0,-1).map(td=>td.innerText);
        
        if(tr.classList.contains("editing")) return;
        tr.classList.add("editing");

        trData.slice(1,-1).forEach(tdData => {      
            const td = tdData.closest("td");               
            const inputElmt = document.createElement("input");
            if(tdData.cellIndex == trData.length - 2){
                tdData.innerHTML = `
                <button class='submitEdit'> ✔ </button>`;
                return;
            };
            inputElmt.type = "text";
            inputElmt.value = td.innerText;
            inputElmt.style.width = "100%";
            td.innerText = "";
            td.appendChild(inputElmt);
            if(tdData.cellIndex == 1){inputElmt.focus()};
        });        

        tr.querySelector(".submitEdit").addEventListener("click", async ()=>{            
            const DATA = Array();
            const updateLogin = Array();
            const newData = Array();

            tr.querySelectorAll("input").forEach(inp => {
                newData.push(inp.value);
            });        

            newData.unshift(trData[0].innerText);
            newData.push(oldVal[oldVal.length-1]);
                        
            oldVal.forEach((td,i)=>{                
                // alert(`${td} ${i}`);
                if(td !== newData[i]){
                    if(stdHead[i] === "name" || stdHead[i] === "id"){
                        updateLogin.push(`${stdHead[i]} = '${newData[i]}'`);
                    }
                    const str = `${stdHead[i]} = '${newData[i]}'`;
                    DATA.push(str);
                }
            });       

            if(DATA.length !== 0){
                if(confirm("保存更改？")){
                    clickedS = false;
                    tr.classList.remove("editing");
                    var SQL = new String();
                    if(updateLogin.length !== 0){
                        let loginIdentifier = tr.cells[10].innerText;
                        SQL = `UPDATE login_info SET ${updateLogin} WHERE logIdentifier = '${loginIdentifier}'`;
                        const res = await fetch("/api/editUser", {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({sql: SQL})
                        });
                        // const result = await res.json();
                    }

                    SQL = `UPDATE student_info SET ${DATA} WHERE num = ${trData[0].innerText}`;
                    // alert(SQL);
                    const res = await fetch("/api/editUser", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({sql: SQL})
                    });
                    const result = await res.json();

                    if(result.success){
                        trData.slice(1,-1).forEach(col => {
                        if(col.cellIndex == trData.length - 2){
                            col.innerHTML = `
                            <button class='dltBtn'> X </button>`;
                            return;
                        }                
                        const v = col.querySelector("input").value;
                        col.innerText = v;
                        });
                    }
                    alert(result.message);                                    
                }
            }else{
                trData.forEach((col, i) => {
                    if(i == trData.length - 2){
                        col.innerHTML = `
                        <button class='dltBtn'> X </button>`;
                        return;                        
                    }
                    col.innerText = oldVal[i];
                });
                clickedS = false;
                tr.classList.remove("editing");
                tr.removeEventListener("keydown", exitEditHandler);
            }
        });

        function exitEditHandler(exitEdit){
            if(exitEdit.key === "Escape"){
                if(confirm("是否退出编辑？")){
                    trData.forEach((col, i) => {        
                        if(i == trData.length - 2){
                            col.innerHTML = `
                            <button class='dltBtn'> X </button>`;
                            return;        
                        }
                        col.innerText = oldVal[i];
                    });
                    clickedS = false;
                    tr.classList.remove("editing");
                }      
                tr.removeEventListener("keydown", exitEditHandler);           
            }
        }
        tr.addEventListener("keydown", exitEditHandler);
    });

    //添加学生
    const addStdBtn = document.getElementById("addStudent").querySelector("button");

    addStdBtn.addEventListener("click", (addUser)=>{
        if(addingS) return;
        if(clickedS) return;
        addUser.preventDefault();
        addingS = true;
        const tableBody = document.getElementById("stdTabBody");
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td align="center"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td align="center"><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;" placeholder="optional"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td align="center"><button class='submitAdd'> ✔ </button></td>`;            
        tableBody.append(newRow);
        tableBody.querySelector("input").focus();

        tableStd.querySelector(".submitAdd").addEventListener("click", async (subAdd)=>{
            const tr = subAdd.target.closest("tr");
            const newRowValues = Array.from(tr.querySelectorAll("input")).map(td => `'${td.value}'`);
            let allPass = true;

            for(let i=0; i<newRowValues.length; i++){
                if(newRowValues[i] == "''"){
                    if(i == 6){
                        newRowValues[i] = null;
                        continue;
                    }
                    allPass = false;
                    alert("未填必填项");
                    break;
                }
            }

            if(allPass){
                const addSql = `INSERT INTO student_info (name, id, gender, academy, class, phone_number, email, degree) VALUES (${newRowValues[0]}, ${newRowValues[1]}, ${newRowValues[2]}, ${newRowValues[3]}, ${newRowValues[4]}, ${newRowValues[5]}, ${newRowValues[6]}, ${newRowValues[7]})`;
                const addLogInfo = `INSERT INTO login_info (user, id, password, active) VALUES (${newRowValues[0]}, ${newRowValues[0]}, '123', '0')`;
                const res = await fetch("/api/addUser", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({sql: addSql, logSql: addLogInfo})
                });
                const result = await res.json();
                alert(result.message);
                if(result.success){
                    location.reload();
                }
            }
        });       

        function exitAddingHandler(exitAdd){
            const currentTr = exitAdd.target.closest("tr");
            if(exitAdd.key === "Escape"){                
                if(confirm("是否退出添加？")){
                    currentTr.remove();
                    addingS = false;
                }
            }
            document.removeEventListener("keydown", exitAddingHandler);
        }         
        document.addEventListener("keydown", exitAddingHandler);
    });
    //编辑教师信息
    tchTabBody.addEventListener("dblclick", function(tch){
        if(clickedT) return;
        if(addingT) return;
        clickedT = true;

        tch.preventDefault();
        const tr = tch.target.closest("tr");
        const trData = Array.from(tr.cells);
        const oldVal = Array.from(tr.cells).slice(0,-1).map(td=>td.innerText);

        if(tr.classList.contains("editing")) return;
        tr.classList.add("editing");

        trData.slice(1,-1).forEach(tdData => {
            const td = tdData.closest("td");
            const inputElmt = document.createElement("input");
            if(tdData.cellIndex == trData.length - 2){
                tdData.innerHTML = `
                <button class='submitEdit'> ✔ </button>`;
                return;
            }
            inputElmt.type = "text";
            inputElmt.value = td.innerText;
            inputElmt.style.width = "100%";
            td.innerText = "";
            td.appendChild(inputElmt);
            if(tdData.cellIndex == 1){inputElmt.focus()};
        });

        tr.querySelector(".submitEdit").addEventListener("click", async() => {            
            const DATA = Array();
            const newData = Array();
            const updateLogin = Array();

            tr.querySelectorAll("input").forEach(inp => {
                newData.push(inp.value);
            });

            newData.unshift(trData[0].innerText);
            newData.push(oldVal[oldVal.length-1]);

            oldVal.forEach((td, i)=>{
                if(td !== newData[i]){
                    if(tchHead[i] === "name" || tchHead[i] === "id"){
                        updateLogin.push(`${tchHead[i]} = '${newData[i]}'`);
                    }                    
                    const str = `${tchHead[i]} = '${newData[i]}'`;
                    DATA.push(str);
                }
            });

            if(DATA.length !== 0){
                if(confirm("保存更改？")){
                    clickedT = false;
                    tr.classList.remove("editing");
                    var SQL = new String();
                    if(updateLogin.length !== 0){                        
                        let loginIdentifier = tr.cells[9].innerText;
                        SQL = `UPDATE login_info SET ${updateLogin} WHERE logIdentifier = '${loginIdentifier}'`;
                        const res = await fetch("/api/editUser", {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify({sql: SQL})
                        });
                    }
                    SQL = `UPDATE teacher_info SET ${DATA} WHERE num = ${trData[0].innerText}`;
                    const res = await fetch("/api/editUser", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({sql: SQL})
                    });
                    const result = await res.json();

                    if(result.success){
                        trData.slice(1,-1).forEach(col => {
                            if(col.cellIndex == trData.length - 2){
                                col.innerHTML = `
                                <button class='dltBtn'> X </button>`;
                                return;
                            }
                            const v = col.querySelector("input").value;
                            col.innerText = v;
                        });
                    }
                    alert(result.message);
                }
            }else{
                trData.forEach((col, i) => {
                    if(i == trData.length - 2){
                        col.innerHTML = `
                        <button class='dltBtn'> X </button>`;
                        return;
                    }
                    col.innerText = oldVal[i];
                });
                clickedT = false;
                tr.classList.remove("editing");
                tr.removeEventListener("keydown", exitEditHandler);
            }
        });

        function exitEditHandler(exitEdit){
            if(exitEdit.key === "Escape"){
                if(confirm("是否退出编辑？")){
                    trData.forEach((col, i) => {
                        if(i == trData.length - 2){
                            col.innerHTML = `
                            <button class='dltBtn'> X </button>`;
                            return;
                        }
                        col.innerText = oldVal[i];
                    });
                    clickedT = false;
                    tr.classList.remove("editing");
                }
                tr.removeEventListener("keydown", exitEditHandler);
            }
        }
        tr.addEventListener("keydown", exitEditHandler);
    });

    //添加教师
    const addTchBtn = document.getElementById("addTeacher").querySelector("button")

    addTchBtn.addEventListener("click", (addUser) => {
        addUser.preventDefault();
        if(clickedT) return;
        if(addingT) return;
        addingT = true;
        const tableBody = document.getElementById("tchTabBody");
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td align="center"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td align="center"><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;" placeholder="optional"></td>
            <td><input type="text" style="width: 100%;" placeholder="optional"></td>
            <td align="center"><button class='submitAdd'> ✔ </button></td>`;            
        tableBody.appendChild(newRow);
        tableBody.querySelector("input").focus();

        tableTch.querySelector(".submitAdd").addEventListener("click", async (subAdd)=>{
            const tr = subAdd.target.closest("tr");
            const newRowValues = Array.from(tr.querySelectorAll("input")).map(td=>`'${td.value}'`);
            let allPass = true;

            for(let i=0; i<newRowValues.length; i++){
                if(newRowValues[i] == "''"){
                    if(i == 5 || i == 6){
                        newRowValues[i] = null;
                        continue;
                    }
                    allPass = false;
                    alert("未填必填项");
                    break;
                }
            }     
            
            if(allPass){
                const addSql = `INSERT INTO teacher_info (name, id, gender, title, department, email, contact) VALUES (${newRowValues[0]}, ${newRowValues[1]}, ${newRowValues[2]}, ${newRowValues[3]}, ${newRowValues[4]}, ${newRowValues[5]}, ${newRowValues[6]})`;
                const addLogInfo = `INSERT INTO tescher_info (name, id, password, active) VALUE (${newRowValues[0]}, ${newRowValues[1]}, '123', '0')`;

                const res = await fetch("/api/addUser", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({sql: addSql, logInfo: addLogInfo})
                });
                const result = await res.json();
                alert(result.message);
                if(result.success){
                    location.reload();
                }
            }
        });

        function exitAddingHandler(exitAdd){
            const currentTr = exitAdd.target.closest("tr");
            if(exitAdd.key === "Escape"){                
                if(confirm("是否退出添加？")){
                    currentTr.remove();
                    addingT = false; 
                }
            }
            document.removeEventListener("keydown", exitAddingHandler);
        }         
        document.addEventListener("keydown", exitAddingHandler);        
    });

    const fw = document.getElementById("forward");
    const bw = document.getElementById("backward");
    const S = document.getElementById("start");
    const E = document.getElementById("end");

    S.addEventListener("click", () => {
        pageNum.textContent = 1;
        sessionStorage.setItem("pageNum", pageNum.textContent);
        loadCourses(searchText = searchText, option = selectedOption);
    });

    E.addEventListener("click", () => {
        pageNum.textContent = maxPage;
        sessionStorage.setItem("pageNum", pageNum.textContent);
        loadCourses(searchText = searchText, option = selectedOption);
    });

    fw.addEventListener("click", () => {
        if(pageNum.textContent < maxPage){
            pageNum.textContent ++;
            sessionStorage.setItem("pageNum", pageNum.textContent);
            loadCourses(searchText = searchText, option = selectedOption);
        }
    });

    bw.addEventListener("click", () => {
        if(pageNum.textContent > 1){
            pageNum.textContent --;
            sessionStorage.setItem("pageNum", pageNum.textContent);
            loadCourses(searchText = searchText, option = selectedOption);
        }
    });    
});
