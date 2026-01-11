document.addEventListener("DOMContentLoaded", async ()=>{
    const userName = document.getElementById("userName");
    const userGet = sessionStorage.getItem('username');
    const IDget = sessionStorage.getItem("ID");
    let curW = 2;

    const timeTable = { "1": "第一大节 8:00 ~ 9:40", 
                        "2": "第二大节 10:10 ~ 11:50",
                        "3": "第三大节 13:45 ~ 15:25",
                        "4": "第四大节 15:55 ~ 17:35",
                        "5": "第五大节 18:45 ~ 20:25",
                        "6": "第六大节 20:35 ~ 21:20"};
    const weekSys = {"A": "", "O": "(单周)", "E": "(双周)"}

    const days = {"1": "M", "2": "Tu", "3": "W", "4": "Th", "5": "F", "6": "St", "7": "Sn"};
    const daySys = {"1": "星期一", "2": "星期二", "3": "星期三", "4": "星期四", "5": "星期五", "6": "星期六", "7": "星期日"};

    userName.textContent = userGet ? userGet : "12345678901234567890";

    const buttons = document.querySelectorAll(".button");
    const tables = document.querySelectorAll("table");
    
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
        
        tables.forEach(tbl => {
            tbl.classList.add("hidden");
        });
        document.getElementById(targetId).classList.remove("hidden");
    }

    buttons.forEach(button => {
        button.addEventListener('click', () =>{
            const targetId = button.getAttribute("data-target");
            activateTab(targetId);
            sessionStorage.setItem("activeTab", targetId);
        });
    });

    const schedule = document.getElementById('schedule');    
    const schBody = document.getElementById("schBody");
    const page = document.getElementById("pageNum");    
    const coursesData = await fetch(`/api/student/schedule/${IDget}`);
    const DATA = await coursesData.json();
    // const reasonPop = document.getElementById("unsubReason");

    // 更新显示函数
    async function updateWeekDisplay() {
        schedule.querySelector(".week").innerHTML = `<th colspan="8"> 第 ${curW} 周 </th>`;
        page.innerText = curW;
        
        // 清空课表内容
        const tds = schBody.querySelectorAll('td');
        tds.forEach(td => td.innerHTML = '');
        
        // 重新加载数据
        DATA.data.forEach(row => {
            const time = row.time[0];
            const wSys = weekSys[row.time[1]];
            const day = days[row.day];
            const tr = schBody.querySelector(`tr[data-section = "${time}"]`);
            if(tr){
                const td = tr.querySelector(`td.${day}`);
                if(row.time[1] == "A"){
                    td.innerHTML = `${row.course_name} ${row.name} ${row.classroom} ${wSys}`;
                }else if(curW % 2 == 0 && row.time[1] == "E"){
                    td.innerHTML = `${row.course_name} ${row.name} ${row.classroom} ${wSys}`;
                }else if(curW % 2 !== 0 && row.time[1] == "O"){
                    td.innerHTML = `${row.course_name} ${row.name} ${row.classroom} ${wSys}`;
                }
            }
        });
    }
    
    // 初始化显示
    updateWeekDisplay();

    const fw = document.getElementById("forward");
    const bw = document.getElementById("backward");

    fw.addEventListener("click", (f) => {
        f.preventDefault();
        if (curW < 20) { // 假设最大20周
            curW += 1;
            updateWeekDisplay();
        }
    });

    bw.addEventListener("click", (b) => {
        b.preventDefault();
        if (curW > 1) { // 最小第1周
            curW -= 1;
            updateWeekDisplay();
        }
    });


    function shakeAnimation(element, timeout){
        element.classList.add("shake-animation");
        setTimeout(() => {
            element.classList.remove("shake-animation");
        }, timeout);
    }
    showList();

    function showList(){    
        const listBody = document.getElementById("listBody");        
        let i = 1;
        DATA.data.forEach(row => {
            const time = `${daySys[row.day]} ${timeTable[row.time[0]]} ${weekSys[row.time[1]]}`;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="num">${i}</td>
                <td>${row.course_name}</td>
                <td>${row.course_code}</td>
                <td>${row.classroom}</td>
                <td>${time}</td>
                <td>${row.name}</td>
                <td>${row.department}</td>
                <td class="num">${row.credit}</td>
                <td><button class="unSub"> 退课 </button></td>`;
            listBody.appendChild(tr);
            i++;
        });

        listBody.addEventListener("click", async (unSub) => {            
            if(unSub.target.classList.contains("unSub")){                
                const row = unSub.target.closest("tr");
                if(confirm(`是否确定退课 ${row.cells[1].innerText}`)){
                    const unsub = await fetch("/api/student/unsubCourse", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({courseCode: row.cells[2].innerText, studentID: IDget, teacherName: row.cells[5].innerText})
                    });
                    const unsubRes = await unsub.json();
                    alert(unsubRes.message);  
                    location.reload();                  
                }
            }
        });
    }
    // let selectedReason = false;

    // function unsubReasonPop(data){    
    //     reasonPop.style.display = "block";
    //     const cName = document.getElementById("unCourse");
    //     const closePop = document.getElementById("closeWindow");
    //     const submitReasonBtn = document.getElementById("submitUnSubReason");
    //     const reasonOpt = document.getElementById("reason");
    //     const reasonInput = document.getElementById("reasonInput");
    //     let UNSUB = "";

    //     cName.textContent = `课程：${data.cells[1].innerText}`;

    //     reasonOpt.addEventListener("change", function(){
    //         selectedReason = true;
    //         if(this.value == "其他原因"){
    //             reasonInput.style.display = "block";                                
    //         }else{
    //             reasonInput.style.display = "none";
    //         }
    //         UNSUB = this.value;            
    //     });

    //     function exitPop(){
    //         reasonPop.style.display = "none";
    //         closePop.removeEventListener("click", exitPop);
    //         submitReasonBtn.removeEventListener("click", submitReason);
    //     }

    //     async function submitReason(){
    //         if(!selectedReason){
    //             shakeAnimation(reasonOpt, 500);
    //             reasonOpt.focus();
    //         }else{
    //             if(reasonOpt.value == "其他原因"){
    //                 if(reasonInput.value == ""){    
    //                     reasonOpt.classList.remove("shake-animation");                
    //                     reasonInput.classList.add("shake-animation");
    //                     setTimeout(() => {
    //                         reasonInput.classList.remove("shake-animation");
    //                     }, 500);         
    //                     reasonInput.focus();               
    //                 }else{
    //                     UNSUB = reasonInput.value;
    //                 }
    //             }
    //             if(confirm(`是否退课 ${data.cells[1].innerText}`)){
    //                 const reqDate = new Date();
    //                 const course_name = data.cells[1].innerText;
    //                 const course_code = data.cells[2].innerText;

    //                 const unsubReq = await fetch("/api/student/unsubRequest", {
    //                     method: "POST",
    //                     headers: {"Content-Type": "application/json"},
    //                     body: JSON.stringify({COURSE: course_name,  CODE: course_code, DATE: reqDate, REASON: UNSUB, ID: IDget, NAME: userGet})
    //                 });
    //                 const reqResult = await unsubReq.json();
    //                 alert(reqResult.message);
    //                 exitPop();
    //             }                
    //         }
    //     }
    //     closePop.addEventListener("click", exitPop);
    //     submitReasonBtn.addEventListener("click", submitReason);
    // }
});