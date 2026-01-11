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
    const weekSys = {"A": "", "O": "(单周)", "E": "(双周)"}
    const days = {"1": "星期一", "2": "星期二", "3": "星期三", "4": "星期三", "5": "星期五", "6": "星期六", "7": "星期日"};    
    
    const dropdownMenu = document.getElementById("dropMenu");
    fetch("/api/course/info")
        .then(res => res.json())
        .then(data => {
            if(data.success){
                data.department.forEach(dep => {
                    dropdownMenu.add(new Option(dep));
                });
            }
        }).catch(err => console.error("获取部门失败:", err));;    
    
    const pageNum = document.getElementById("pageNum");
    const tfoot = document.getElementById("naviFoot");
    let maxPage = new Number();

    if(sessionStorage.getItem("pageNum")){
        pageNum.textContent = sessionStorage.getItem("pageNum");
    }else{
        pageNum.textContent = 1;
    }

    const courseTable = document.getElementById("courseBody");

    async function loadCourses(searchText = "", option = ""){
        courseTable.innerHTML = "";        
        fetch(`/api/admin/courses?search=${searchText}&option=${option}`)
                .then(res => res.json())
                .then(data => {
                    if(data.success){
                        maxPage = Math.ceil(Object.keys(data.data).length / 20);
                        // alert(maxPage);
                        if(maxPage > 1){tfoot.style.display = "block";}else{tfoot.style.display = "none";}
                        let p = 20 * pageNum.textContent;

                        for(let i = p-20; i < p; i++){
                            row = data.data[i];
                            const tr = document.createElement("tr");
                            const time = `${days[row.day]} ${timeTable[row.time[0]]}${weekSys[row.time[1]]}`;
                            const capCount = `${row.current_student}/${row.max_student}`;
                            const index = i + 1;
                            tr.innerHTML = `
                                <td class="num">${index}</td>
                                <td>${row.course_name}</td>
                                <td>${row.course_code}</td>
                                <td>${row.department}</td>
                                <td>${time}</td>
                                <td>${row.name}</td>
                                <td class="num">${row.credit}</td>
                                <td>${row.classroom}</td>
                                <td>${capCount}</td>
                                <td class="num"><button class="dltCourse"> x </button></td>`;
                            courseTable.appendChild(tr);                              
                        }
                    }
                });
    }

    courseTable.addEventListener("click", async (d) => {
        if(d.target && d.target.classList.contains("dltCourse")){
            d.preventDefault();
            const row = d.target.closest("tr");
            const courseCode = row.cells[2].innerText;
            const teacherName = row.cells[5].innerText;

            if(confirm(`是否删除 ${teacherName}教师的课程 ${row.cells[1].innerText}`)){
                const res = await fetch("/api/admin/dltCourse", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({CODE: courseCode, teacher: teacherName})
                });
                const dltRes = await res.json();
                alert(dltRes.message);
            }
        }
    });

    let searchText = "";
    let selectedOption = "";

    document.getElementById("search").addEventListener("input", function(){
        searchText = this.value;    
        loadCourses(searchText = searchText, option = selectedOption);       
    });

    document.getElementById("dropMenu").addEventListener("change", function(){
        selectedOption = this.value; 
        if(selectedOption=="全部"){selectedOption="%%"}
        loadCourses(searchText = searchText, option = selectedOption);     
    });

    loadCourses(searchText = searchText, option = selectedOption);

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
