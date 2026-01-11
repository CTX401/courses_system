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
    const weekSys = {"A": "(全周)", "O": "(单周)", "E": "(双周)"}

    const days = {"1": "M", "2": "Tu", "3": "W", "4": "Th", "5": "F", "6": "St", "7": "Sn"};

    const notification = document.getElementById("notification");

    const getNotice = await fetch(`/api/teacher/notification?ID=${tchId}`);
    const newNoti = await getNotice.json();
    const notiCont = document.getElementById("notification-sidebar");
    let noti_open = false;
    const notiBody = document.getElementById("noti");
    
    const readNote = new Array();

    newNoti.data.forEach(note => {
        if(note.condition == "待处理") return
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
        .then(res => res.json())
        .then(data => {
            if(data.success){
                const schBody = document.getElementById("schBody");

                data.data.forEach(row => {
                    const time = row.time[0];
                    const day = days[row.day];
                    const courseDisplay = `${row.course_name}${weekSys[row.time[1]]}`;

                    const tr = schBody.querySelector(`tr[data-section = "${time}"]`);
                    const td = tr.querySelector(`td.${day}`);

                    td.innerHTML = `${courseDisplay} <br> ${row.classroom}`;
                });
            }
        });
});
