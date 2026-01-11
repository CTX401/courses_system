document.addEventListener("DOMContentLoaded",async ()=>{
    const userName = document.getElementById("userName");
    const userGet = sessionStorage.getItem('username');

    userName.textContent = userGet ? userGet : "12345678901234567890";
    const tchId = sessionStorage.getItem("ID");

    const timeTable = { "1": "第一大节 8:00 ~ 9:40", 
                        "2": "第二大节 10:10 ~ 11:50",
                        "3": "第三大节 13:45 ~ 15:25",
                        "4": "第四大节 15:55 ~ 17:35",
                        "5": "第五大节 18:45 ~ 20:25",
                        "6": "第六大节 20:35 ~ 21:20"};

    const weekSys = {"A": "", "O": "(单周)", "E": "(双周)"}

    const days = {"1": "星期一", "2": "星期二", "3": "星期三", "4": "星期四", "5": "星期五", "6": "星期六", "7": "星期日"};

    const timeTableC = { "第一大节 (8:00~9:40)": "1", 
                        "第二大节 (10:10~11:50)": "2",
                        "第三大节 (13:45~15:25)": "3",
                        "第四大节 (15:55~17:35)": "4",
                        "第五大节 (18:45~20:25)": "5",
                        "第六大节 (20:35~21:20)": "6"};
    const weekSysC = {"全": "A", "单": "O", "双": "E"}
    const daysC = {"一": "1", "二": "2", "三": "3", "四": "4", "五": "5", "六": "6", "日": "7"};  

    const tbody = document.getElementById("tbody");
    let selectedReason = false;
    const notification = document.getElementById("notification");

    const getNotice = await fetch(`/api/teacher/notification?ID=${tchId}`);
    const newNoti = await getNotice.json();
    const notiCont = document.getElementById("notification-sidebar");
    let noti_open = false;
    const notiBody = document.getElementById("noti");
    var myDepartment = new String();
    const readNote = new Array();
    let haveUnread = false;

    newNoti.data.forEach(note => {
        if(note.condition == "待处理") return
        if(haveUnread == false && note.read == "unread"){
            haveUnread = true;
        }
        if(note.read == "read") return readNote.push(note);
        const li = document.createElement("li");
        const reqCondition = JSON.parse(note.condition);
        const reqContent = JSON.parse(note.request);
        let notiMessage = ""

        if(reqCondition.decision == "驳回"){
            if(note.type == "添加课程"){
                notiMessage = `被<span style="color:red">驳回</span>, 原因：${reqCondition.reason}`;                
            }else if(note.type == "删除课程"){
                notiMessage = `被<span style='color:red'>驳回</span>`;
            }
        }else if(reqCondition.decision == "通过"){
            notiMessage = `<span style='color:green'>通过</span>`;
        }
        li.innerHTML = `您 '${note.type} ${reqContent.course_name}' 的请求已 ${notiMessage}`;
        li.setAttribute("DATE", `${note.date}`);
        notiBody.appendChild(li);
    });
    
    if(haveUnread){shakeAnimation(notification, 1000);}

    readNote.forEach(r => {
        const Rli = document.createElement("li");
        const RreqCondition = JSON.parse(r.condition);
        const RreqContent = JSON.parse(r.request);
        let rMessage = ""

        if(RreqCondition.decision == "驳回"){
            if(r.type == "添加课程"){
                rMessage = `被<span style="color:red">驳回</span>, 原因：${RreqCondition.reason}`;                
            }else if(r.type == "删除课程"){
                rMessage = `被<span style='color:red'>驳回</span>`;
            }
        }else if(RreqCondition.decision == "通过"){
            rMessage = `<span style='color:green'>通过</span>`;
        }
        Rli.innerHTML = `您 '${r.type} ${RreqContent.course_name}' 的请求已 ${rMessage}`;
        Rli.style.opacity = 0.6;
        // Rli.setAttribute("DATE", `${note.date}`);
        notiBody.appendChild(Rli);        
    });

    notification.addEventListener("mouseover", notiOver);
    notification.addEventListener("mouseout", notiOut);

    notification.addEventListener("click", ()=>{
        if(notiCont.style.display == "block" && noti_open == false){
            notiCont.style.display = "none";
        }else{
            noti_open = false;
            notiCont.style.display = "block";
            notification.removeEventListener("mouseover", notiOver);
            notification.removeEventListener("mouseout", notiOut);

            document.getElementById("content").addEventListener("click", (n) => {
                n.preventDefault();
                notification.addEventListener("mouseover", notiOver);
                notification.addEventListener("mouseout", notiOut);                        
                notiOut();
            });
        }
    });

    function notiOver(){
        timeout = setTimeout(()=>{
            notiCont.style.display = "block";
            noti_open = true;
        }, 400);
    }

    function notiOut(){
        notiCont.style.display = "none";
        clearTimeout(timeout);
    }

    notiBody.addEventListener("click", async(L) => {
        const LI = L.target.closest("li");        
        setRead(LI);
    });
    
    document.getElementById("readAll").addEventListener("click", async() => {
        const li_List = notiBody.querySelectorAll("li");
        li_List.forEach(li => {
            setRead(li);
        });
    });

    async function setRead(element){
        const updateNoti = await fetch("/api/teacher/clear_notification", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({tchId: tchId, DATE: element.getAttribute("DATE")})
        });
        const uN = await updateNoti.json();
        if(uN.success){element.style.opacity=0.6;}
    }

    fetch(`/api/teacher/courses/${tchId}`)        
        .then(resTch => resTch.json())
        .then(data => {
            if(data.success){
                myDepartment = data.data[0].department;
                let i = 1;
                data.data.forEach(row => {
                    const tr = document.createElement("tr");
                    const time = `${days[row.day]} ${timeTable[row.time[0]]} ${weekSys[row.time[1]]}`;
                    const capacity = `${row.current_student} / ${row.max_student}`;

                    tr.innerHTML = `
                        <td class="num">${i}</td>
                        <td>${row.course_name}</td>
                        <td>${row.course_code}</td>
                        <td>${row.department}</td>
                        <td>${time}</th>
                        <td>${row.classroom}</td>
                        <td class="num">${row.credit}</td>
                        <td>${capacity}</td>
                        <td align="center"><button class="ckStd"> 查看 </button></td>
                        <td align="center"><button class='dltCourse'> X </button></td>`;
                    tbody.appendChild(tr);
                    i += 1;
                });
            }
        });
    
    tbody.addEventListener("click", async function(f){
        if(f.target.classList.contains("dltCourse")){
            const row = f.target.closest("tr");        
            const course = row.cells[1].innerText;
            const course_code = row.cells[2].innerText;

            dltReasonPopWindow(course, course_code);
        }
    });

    const reasonPop = document.getElementById("dltReason");

    function shakeAnimation(element, timeout){
        element.classList.add("shake-animation");
        setTimeout(() => {
            element.classList.remove("shake-animation");
        }, timeout);
    }

    function dltReasonPopWindow(course, course_code){
        reasonPop.style.display = "block";        

        const reasonOpt = document.getElementById("reason");
        const reasonInput = document.getElementById("reasonInput");
        const submitDltClass = document.getElementById("submitDltClass");
        const closePop = document.getElementById("closeDltPop");
        const rqName = document.getElementById("dltClass");
    
        let dltReason = "";
        rqName.textContent = `课程名：${course}`;

        reasonOpt.addEventListener("change", function(){
            selectedReason = true;
            if(this.value == "其他原因"){
                reasonInput.style.display = "block";                                
            }else{
                reasonInput.style.display = "none";
            }
            dltReason = this.value;
        });

        function exitPop(){
            selectedReason = false;            
            reasonOpt.innerHTML = `
                <option disabled selected hidden> 选择删除原因 </option>
                <option>健康状态不佳</option>
                <option>家庭突发事件</option>
                <option>经济困难</option>
                <option>学术误导</option>
                <option>自然灾害</option>
                <option>安全问题</option>
                <option>心理困扰</option>
                <option>师资变动</option>
                <option>课程冲突</option>
                <option>其他原因</option>            
            `;
            reasonInput.style.display = "none";
            reasonPop.style.display = "none";     
            closePop.removeEventListener("click", exitPop);
            submitDltClass.removeEventListener("click", subRequest);       
        }

        async function subRequest(){
            if(!selectedReason){
                shakeAnimation(reasonOpt, 500);
                reasonOpt.focus();
            }else{
                if(reasonOpt.value == "其他原因"){
                    if(reasonInput.value == ""){               
                        shakeAnimation(reasonInput, 500);
                        reasonInput.focus();
                        return ;
                    }else{
                        dltReason = reasonInput.value;
                    }
                }
                if(confirm(`是否删除 ${course}`)){
                    const reqDate = new Date();
                    const dltReq = await fetch("/api/teacher/deleteRequest", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({COURSE: course,  CODE: course_code, DATE: reqDate, REASON: dltReason, ID: tchId, NAME: userGet})
                    });
                    const reqResult = await dltReq.json();
                    alert(reqResult.message);
                    exitPop();
                }                
            }
        }
        submitDltClass.addEventListener("click", subRequest);    
        closePop.addEventListener("click", exitPop);  
    }

    tbody.addEventListener("click", (ck)=>{
        if(ck.target.classList.contains("ckStd")){
            const tr = ck.target.closest("tr");
            // alert(userGet);
            showStudents(tr.cells[2].innerText, userGet);
        }
    });
    const checkStd = document.getElementById("showStdPop");    

    async function showStudents(course_code, teacherName){
        const getStd = await fetch("/api/teacher/checkStudent", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({course_code: course_code, teacherName: teacherName})
        });
        const stdData = await getStd.json();
        checkStd.style.display = "block";
        const infoBody = document.getElementById("infoBody");
        infoBody.innerHTML = "";
        let i = 1;
        const stdCount = document.getElementById("stdCount");
        // alert(Object.keys(stdData.data));
        stdData.data.forEach(D => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="num">${i}</td>
                <td>${D.name}</td>
                <td>${D.id}</td>
                <td>${D.class}</td>
                <td>${D.gender}</td>
                <td>${D.academy}</td>
                <td><button class="removeStd"> x </button></td>`;
            infoBody.appendChild(tr);            
            i++;
        });
        stdCount.textContent = `总人数：${i-1}`;

        const closeWindow = document.getElementById("closeStdPop");

        function closeShow(){
            checkStd.style.display = "none";
            searchText.value = "";
            closeWindow.removeEventListener("click", closeShow);
            infoBody.removeEventListener("click", removeStudent);
        }

        const searchBtn = document.getElementById("startSearch");
        const searchText = document.getElementById("search");

        searchBtn.addEventListener("click", (s) => {
            s.preventDefault();
            i = 1;
            if(searchText.value != ""){
                infoBody.innerHTML = "";
                stdData.data.forEach(D => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="num">${i}</td>
                        <td>${D.name}</td>
                        <td>${D.id}</td>
                        <td>${D.class}</td>
                        <td>${D.gender}</td>
                        <td>${D.academy}</td>
                        <td><button class="removeStd"> x </button></td>`;

                    if(D.id == searchText.value || D.name == searchText.value){
                        infoBody.appendChild(tr);      
                        i++;                                          
                    }
                });                
            }else{
                infoBody.innerHTML = "";
                let i = 1;
                stdData.data.forEach(D => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td class="num">${i}</td>
                        <td>${D.name}</td>
                        <td>${D.id}</td>
                        <td>${D.class}</td>
                        <td>${D.gender}</td>
                        <td>${D.academy}</td>
                        <td><button class="removeStd"> x </button></td>`;
                    infoBody.appendChild(tr);
                    i++;
                });                
            }
        });

        async function removeStudent(target){
            if(target.target.classList.contains("removeStd")){
                const row = target.target.closest("tr");
                if(confirm(`是否将 ${row.cells[1].innerText} 移出课程`)){
                    const rmStd = await fetch("/api/student/unsubCourse", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({courseCode: course_code, studentID: row.cells[2].innerText, teacherName:teacherName})
                    });
                    const rmRes = await rmStd.json();
                    alert(rmRes.message);                    
                }

            }
        }
        
        closeWindow.addEventListener("click", closeShow);
        infoBody.addEventListener("click", removeStudent);
    }    

    const addCourse = document.getElementById("addCourse").querySelector("button");
    const coursePop = document.getElementById("coursePop");
    const exitAddBtn = document.getElementById("closeAddPop");

    const course = document.getElementById("courseName");
    const session = document.getElementById("session");
    const day = document.getElementById("day");
    const mode = document.getElementById("mode");
    const location = document.getElementById("location");
    const credit = document.getElementById("credit");
    const capacity = document.getElementById("capacity");

    function exitAddCourse(){
        course.value = "-";
        session.value = "-";
        day.value = "-";
        mode.value = "-";
        location.value = "";
        credit.value = "";
        capacity.value = "";
        coursePop.style.display = "none";
        exitAddBtn.removeEventListener("click", exitAddCourse);
    }

    addCourse.addEventListener("click", (addCourse) => {
        addCourse.preventDefault();
        const courseDrop = document.getElementById("courseName");
        fetch("/api/course/courses")
            .then(res => res.json())
            .then(data => {
                if(data.success){
                    data.data.forEach(d => {
                        courseDrop.add(new Option(d.course))
                    });
                }
            });
        coursePop.style.display = "block";
        exitAddBtn.addEventListener("click", exitAddCourse);
    });

    const addForm = document.getElementById("addCourseForm");

    addForm.addEventListener("submit", async (add) => {
        const allTrue = [false, false, false, false, false, false, false];
        add.preventDefault();
        course.value === "-" ? shakeAnimation(course, 500) : allTrue[0] = true;
        session.value === "-" ? shakeAnimation(session, 500) : allTrue[1] = true;
        day.value === "-" ? shakeAnimation(day, 500) : allTrue[2] = true;
        mode.value === "-" ? shakeAnimation(mode, 500) : allTrue[3] = true;
        location.value === "" ? shakeAnimation(location, 500) : allTrue[4] = true;
        credit.value === "" ? shakeAnimation(credit, 500) : allTrue[5] = true;
        capacity.value === "" ? shakeAnimation(capacity, 500) : allTrue[6] = true;

        if(allTrue.every(v => v === true)){
            const courseValue = {
                course_name: course.value,
                session: timeTableC[session.value],
                day: daysC[day.value],
                mode: weekSysC[mode.value],
                location: location.value,
                credit: credit.value,
                capacity: capacity.value,
                department: myDepartment
            }
            // alert(JSON.stringify(courseValue));
            const date = new Date();    
            const sentVal = JSON.stringify(courseValue);
            const addNewCourse = await fetch("/api/teacher/addRequest", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({data: sentVal, DATE: date, ID: tchId, NAME: userGet})
            });
            const reqResult = await addNewCourse.json();
            alert(reqResult.message);
            if(reqResult.success){
                exitAddCourse();  
                location.reload();              
            }
        }
    });
});
