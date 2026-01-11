document.addEventListener("DOMContentLoaded",()=>{
    const userName = document.getElementById("userName");
    const userGet = sessionStorage.getItem('username');

    userName.textContent = userGet ? userGet : "123456789";

    const timeTable = { "1": "第一大节 8:00 ~ 9:40", 
                        "2": "第二大节 10:10 ~ 11:50",
                        "3": "第三大节 13:45 ~ 15:25",
                        "4": "第四大节 15:55 ~ 17:35",
                        "5": "第五大节 18:45 ~ 20:25",
                        "6": "第六大节 20:35 ~ 21:20"};

    const weekSys = {"A": "全", "O": "单", "E": "双"}

    const days = {"1": "一", "2": "二", "3": "三", "4": "四", "5": "五", "6": "六", "7": "日"};

    const timeTableC = { "第一大节 (8:00~9:40)": "1", 
                        "第二大节 (10:10~11:50)": "2",
                        "第三大节 (13:45~15:25)": "3",
                        "第四大节 (15:55~17:35)": "4",
                        "第五大节 (18:45~20:25)": "5",
                        "第六大节 (20:35~21:20)": "6"};
    const weekSysC = {"全": "A", "单": "O", "双": "E"}
    const daysC = {"一": "1", "二": "2", "三": "3", "四": "4", "五": "5", "六": "6", "日": "7"};    
    
    // 动态为下拉栏添加选项 option
    const dropdownMenu = document.getElementById("dropMenu");
    fetch("/api/admin/requestInfo")
        .then(res => res.json())
        .then(data => {
            if(data.success){
                data.typeList.forEach(dep => {
                    dropdownMenu.add(new Option(dep));
                });
            }
        }).catch(err => console.error("获取部门失败:", err));;

    loadRequest();

    // 抖动动画
    function shakeAnimation(element, timeout){
        element.classList.add("shake-animation");
        setTimeout(() => {
            element.classList.remove("shake-animation");
        }, timeout);
    }    

    // 从数据库后去请求数据
    async function loadRequest(search = "", Type = ""){
        const requestList = await fetch(`/api/admin/requestInfo?search=${search}&Type=${Type}`);
        const reqL = await requestList.json();
        const tableBody = document.getElementById("requestBody");
        tableBody.innerHTML = "";
        let i = 1;

        // 将数据加载进 table
        reqL.data.forEach(row => {            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="num">${i}</td>
                <td>${row.teacher_name}</td>
                <td>${row.teacher_ID}</td>
                <td>${row.type}</td>
                <td>${row.date}</td>
                <td><button class="checkReq"> 查看 </button></td>
                <td style="display:none;">${row.request}</td>`;
            if(row.condition == "待处理"){
                tableBody.appendChild(tr);            
                i++;            
            }

        });

        // 若无匹配数据
        if(tableBody.innerHTML == ""){
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td colspan="6" style="text-align:center;">无匹配数据</td>`;
            tableBody.appendChild(tr);
        }
        
        // alert(JSON.stringify(reqL.data));
        tableBody.addEventListener("click", async (q) => {
            const row = q.target.closest("tr");
            const data = JSON.parse(row.cells[6].innerText);
            checkReq(data, row.cells[3].innerText, row.cells[1].innerText, row.cells[2].innerText, row.cells[4].innerText);
            // alert(JSON.stringify(data));
        });        
    };
    const checkReqPop = document.getElementById("checkReqPop");
    const closeCheck = document.getElementById("closeCheckPop");
    const validatePop = document.getElementById("validating");
    const rejectPop = document.getElementById("rejectPop");

    // 弹窗显示请求的详细信息
    function checkReq(data, type, teacher, ID, DATE){
        checkReqPop.style.display = "block";
        // alert(data);
        const h3 = checkReqPop.querySelector("h3");
        const checking = document.getElementById("checking");
        h3.textContent = `${type}请求`;
        checking.style.display = "none";
        // 不同类型请求不同界面
        const reqInfo = document.getElementById("reqInfo");
        if(type=='删除课程'){

            reqInfo.innerHTML = `
                <span>课程名称：${data.course_name}</span>
                <span>课程编号：${data.course_code}</span>
                <span>授课教师：${teacher}</span>
                <span>删除原有：${data.reason}</span>`;
        }
        if(type=='添加课程'){
            checking.style.display = "inline-block";
            reqInfo.innerHTML = `
                <span>课程名称：${data.course_name}</span>
                <span>上课时段：${timeTable[data.session]}</span>
                <span>上课日：星期${days[data.day]}</span>
                <span>上课模式：${weekSys[data.mode]}周</span>
                <span>上课地点：${data.location}</span>
                <span>学分：${data.credit}</span>
                <span>容量：${data.capacity}</span>`;
        }

        const approved = checkReqPop.querySelector(".approved");
        const reject = checkReqPop.querySelector(".reject");
        closeCheck.addEventListener("click", exitPop);
        
        //驳回操作
        async function triggerReject(){
            if(type=="添加课程"){
                rejectPopWindow(ID, DATE);
            }else{
                if(confirm(`是否驳回 ${teacher} 的删除请求`)){
                    const rejDel = await fetch("/api/admin/request/rejectDel", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({ID: ID, DATE:DATE, TYPE: type})
                    });
                    const rejDelResult = await rejDel.json();
                    alert(rejDelResult.message);
                    location.reload();
                }
            }            
        }

        //同意操作
        async function triggerApproved(){
            if(confirm(`同意 ${teacher} 的请求`)){
                const approvedReq = await fetch("/api/admin/request/approved", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({teacherID: ID, DATE: DATE})
                });
                const aR = await approvedReq.json();
                alert(aR.message);
                location.reload();
            };            
        }
        reject.addEventListener("click", triggerReject);
        approved.addEventListener("click", triggerApproved);

        checking.addEventListener("click", ()=>{
            validatePop.style.display = "block";
            checkValidity(data.location, data.day, data.session, data.mode, data.capacity, ID, data.course_code);
        });

        // 退出详细信息弹窗
        function exitPop(){
            checkReqPop.style.display = "none";
            closeCheck.removeEventListener("click", exitPop);
            reject.removeEventListener("click", triggerReject);
            approved.removeEventListener("click", triggerApproved);
        }        
    }



    // 驳回添加课程原因选着
    function rejectPopWindow(teacherId, DATE){
        rejectPop.style.display = "block";
        const closeReasonBtn = rejectPop.querySelector(".closeRejReason");
        const subReasonBtn = rejectPop.querySelector(".rejBtn");
        const reasonOption = document.getElementById("rejOption");
        const reasonInput = document.getElementById("reasonInput");

        subReasonBtn.addEventListener("click", subRejectReason);
        closeReasonBtn.addEventListener("click", closeReasonPop);

        reasonOption.addEventListener("change", function(){
            if(this.value == "其他原因"){
                reasonInput.style.display = "block";
            }else{
                reasonInput.style.display = "none";
            }
        });

        async function subRejectReason(){
            let REASON = "";            
            if(reasonOption.value == "-"){
                shakeAnimation(reasonOption, 500);
            }else{
                if(reasonOption.value == "其他原因"){
                    if(reasonInput.value == ""){
                        shakeAnimation(reasonInput, 500);
                    }else{
                        REASON = reasonInput.value;
                    }
                }else{
                    REASON = reasonOption.value;                    
                }
            }
            if(REASON == ""){
                return
            }else{
                const sentReason = await fetch("/api/admin/request/rejectAdd", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({teacherId: teacherId, DATE: DATE, REASON: REASON})
                });
                const sentResult = await sentReason.json();
                alert(sentResult.message)
                location.reload();
            }
        }

        function closeReasonPop(){
            rejectPop.style.display = "none";
            closeReasonBtn.removeEventListener("click", closeReasonPop);
        }        
    }
    
    // 检查课程是否合格
    async function checkValidity(classroom, day, session, mode, capacity, teacherId, courseCode){
        const TIME = `${timeTableC[session]}${weekSysC[mode]}`;
        const DAY = daysC[day];
        const CONFLICT = document.getElementById("conflict-check");
        const CAPACTIY = document.getElementById("capacity-check");
        const DUPLICATE = document.getElementById("duplicate-check");

        CONFLICT.querySelectorAll("span").forEach(span => {
            if(span.classList.contains("1")){span.classList.add("pulseLoading");span.style.animationDelay= '-0.48s'}
            if(span.classList.contains("2")){span.classList.add("pulseLoading");span.style.animationDelay= '-0.32s'}
            if(span.classList.contains("3")){span.classList.add("pulseLoading");span.style.animationDelay= '-0.16s'}
        });   
        
        const conflict = await fetch("/api/admin/validating/conflict", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({classroom: classroom, day: DAY, time: TIME})
        });
        const conflictCheck = await conflict.json();

        const CONFLICT_timeout = setTimeout(() => {
            if(conflictCheck.data){
                CONFLICT.querySelectorAll("span").forEach(span => {
                    if(span.classList.contains("1")){span.textContent = " ✔ "}
                    span.classList.remove("pulseLoading");
                });
            }else{
                CONFLICT.querySelectorAll("span").forEach(span => {
                    if(span.classList.contains("1")){span.textContent = " ❌ "}
                    span.classList.remove("pulseLoading");
                });
            }
        }, 2000);

        CAPACTIY.querySelectorAll("span").forEach(span => {
            if(span.classList.contains("1")){span.classList.add("pulseLoading");span.style.animationDelay= '-0.48s'}
            if(span.classList.contains("2")){span.classList.add("pulseLoading");span.style.animationDelay= '-0.32s'}
            if(span.classList.contains("3")){span.classList.add("pulseLoading");span.style.animationDelay= '-0.16s'}
        });   

        const roomCapacity = await fetch("/api/admin/validating/capacity", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({capacity: capacity, classroom: classroom})
        });             
        const roomCapCheck = await roomCapacity.json();

        const CAPACTIY_timeout = setTimeout(() => {
            if(roomCapCheck.data){
                CAPACTIY.querySelectorAll("span").forEach(span => {
                    if(span.classList.contains("1")){span.textContent = " ✔ "}
                    span.classList.remove("pulseLoading");
                });
            }else{
                CAPACTIY.querySelectorAll("span").forEach(span => {
                    if(span.classList.contains("1")){span.textContent = " ❌ "}
                    span.classList.remove("pulseLoading");
                });            
            }
        }, 3000);

        DUPLICATE.querySelectorAll("span").forEach(span => {
            if(span.classList.contains("1")){span.classList.add("pulseLoading");span.style.animationDelay= '-0.48s'}
            if(span.classList.contains("2")){span.classList.add("pulseLoading");span.style.animationDelay= '-0.32s'}
            if(span.classList.contains("3")){span.classList.add("pulseLoading");span.style.animationDelay= '-0.16s'}
        });   

        const duplicate = await fetch("/api/admin/validating/duplicate", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({teacherId: teacherId, course_code: courseCode})
        });
        const dpCheck = await duplicate.json();

        const DUPLICATE_timeout = setTimeout(() => {
            if(dpCheck.data){
                DUPLICATE.querySelectorAll("span").forEach(span => {
                    if(span.classList.contains("1")){span.textContent = " ✔ "}
                    span.classList.remove("pulseLoading");
                });
            }else{
                DUPLICATE.querySelectorAll("span").forEach(span => {
                    if(span.classList.contains("1")){span.textContent = " ❌ "}
                    span.classList.remove("pulseLoading");
                });            
            }
        }, 4000);
        
        const closeVAL = document.getElementById("closeVAL");

        function closeVal(){
            validatePop.style.display = "none";
            CONFLICT.querySelectorAll("span").forEach(span => {span.textContent = ""});
            CAPACTIY.querySelectorAll("span").forEach(span => {span.textContent = ""});
            DUPLICATE.querySelectorAll("span").forEach(span => {span.textContent = ""});      
            clearTimeout(CAPACTIY_timeout);
            clearTimeout(DUPLICATE_timeout);
            clearTimeout(CONFLICT_timeout);            
            closeVAL.removeEventListener("click", closeVal);
        }

        closeVAL.addEventListener("click", closeVal);
    }

    let search = "";
    let Type = "";

    document.getElementById("search").addEventListener("input", function(){
        search = this.value;
        loadRequest(search = search, Type = Type);
    });

    document.getElementById("dropMenu").addEventListener("change", function(){
        Type = this.value;
        if(Type == "全部"){Type = "%%"}
        loadRequest(search = search, Type = Type);
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
