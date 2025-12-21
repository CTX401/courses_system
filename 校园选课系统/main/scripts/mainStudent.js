document.addEventListener("DOMContentLoaded",()=>{
    const userName = document.getElementById("userName");
    const userGet = sessionStorage.getItem('username');
    const IDget = sessionStorage.getItem("ID");

    const timeTable = { "1": "第一大节 8:00 ~ 9:40", 
                        "2": "第二大节 10:10 ~ 11:50",
                        "3": "第三大节 13:45 ~ 15:25",
                        "4": "第四大节 15:55 ~ 17:35",
                        "5": "第五大节 18:45 ~ 20:25",
                        "6": "第六大节 20:35 ~ 21:20"};

    const weekSys = {"A": "", "O": "(单周)", "E": "(双周)"}

    const days = {"1": "星期一", "2": "星期一二", "3": "星期一三", "4": "星期一四", "5": "星期一五", "6": "星期一六", "7": "星期一日"};

    userName.textContent = userGet ? userGet : "12345678901234567890";

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
    // alert(courses);
    // courses.data.forEach(ID => {
    //     dropdownMenu.add(JSON.stringify(ID));
    // });

    async function loadCourses(searchText = "", option = ""){
        const getCourse= await fetch(`/api/course/info?search=${searchText}`);
        const gc = await getCourse.json();
        // alert(searchText);
        // alert(option);
        const tbody = document.getElementById("courseBody");
        tbody.innerHTML = "";
        let courseIndex = 1;

        Object.keys(gc.data).forEach(code => {
            const tr = document.createElement("tr");

            const teacher = [];
            const department = [];
            const time = [];
            const classroom = [];
            const credit = [];
            const maxStd = [];
            let course = "";

            // alert(JSON.stringify(gc.data[infos]));

            gc.data[code].forEach(info => {                
                // alert(JSON.stringify(info.teacher));
                teacher.push(info.teacher);
                department.push(info.department);
                time.push(`${timeTable[info.time[0]]} ${weekSys[info.time[1]]}`);
                classroom.push(info.classroom);
                credit.push(info.credit);
                maxStd.push(info.max_student);
                course = info.course_name;
            });


            tr.innerHTML = `
                <td class="num">${courseIndex}</td>
                <td>${course}</td>
                <td>${[...department].join(",")}</td>
                <td>${[...time].join(",")}</td>
                <td>${[...teacher].join(",")}</td>
                <td class="num">${[...credit].join(",")}</td>
                <td>${[...classroom].join(",")}</td>
                <td>${[...maxStd].join(" , ")}</td>
                <td align="center"><button class="chooseClass"> 选择 </button></td>`;
            courseIndex += 1;

            if(option === "" || option === "全部" || department.includes(option)) {
                tbody.appendChild(tr);
            }            
            // alert(teacher);
            // alert(department);
            // alert(time);
            // alert(classroom);
            // alret(credit);
            // alert(stdCount);
            // alert(course);
        });

        tbody.addEventListener("click", (e) => {
            if(e.target.classList.contains("chooseClass")){
                const course = e.target.closest("tr").querySelector("td:nth-child(2)").textContent;
                showPopUp(course);
            }
        });

        if(tbody.innerHTML == ""){
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td colspan="9" style="text-align:center;">无匹配数据</td>`;
            tbody.appendChild(tr);
        }
    };

    loadCourses();
    let searchText = "";
    let selectedOption = "";

    document.getElementById("search").addEventListener("input", function(){
        searchText = this.value;
        loadCourses(searchText = searchText, option = selectedOption);
    });

    document.getElementById("dropMenu").addEventListener("change", function(){
        selectedOption = this.value;
        loadCourses(searchText = searchText, option = selectedOption);
    });
    // loadCourses(searchText = searchText, option = selectedOption);

    const popUp = document.getElementById("CTpopUp");
    const confirmTch = document.getElementById("confirmTeacher");
    const exitPop = document.getElementById("exitpopUp");

    async function showPopUp(course){
        popUp.style.display = "block";
        const table = document.getElementById("cTtabBody");        
        const choosenCourse =  await fetch(`/api/course/info?search=${course}`);
        const cC = await choosenCourse.json();        
        // alert(JSON.stringify(cC.data));
        // alert(JSON.stringify(Object.values(cC.data)[0][0]));
        table.innerHTML = "";

        Object.values(cC.data)[0].forEach(row => {
            const tr = document.createElement("tr");
            const time = `${timeTable[row.time[0]]} ${weekSys[row.time[1]]}`;
            const stdCount = `${row.current_student}/${row.max_student}`;
            // alert(JSON.stringify(row));
            tr.innerHTML = `
                <td>${course}</td>
                <td>${row.department}</td>
                <td>${time}</td>
                <td>${row.teacher}</td>
                <td>${row.credit}</td>
                <td>${row.classroom}</td>
                <td>${stdCount}</td>
                <td><input type="radio" name="teacherSelect" value=${JSON.stringify(row)}></td>`;
            
            table.appendChild(tr);
        });


        async function choosen(){
            const selectedValue = document.querySelector("input[name='teacherSelect']:checked");
            if(selectedValue == null){
                alert("请选择授课老师");
            }else{
                const valueInfo = JSON.parse(selectedValue.value);                
                // alert(JSON.stringify(valueInfo));
                if(confirm(`是否选择 ${valueInfo.teacher} 为授课老师`)){
                    popUp.style.display = "none";
                    const selected = await fetch("/api/selection/select", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({selectedCourse: valueInfo, studentId: IDget})
                    });
                    const result = await selected.json();
                    alert(result.message);
                    confirmTch.removeEventListener("click", choosen);
                    exitPop.addEventListener("click", exitpop);
                }                
            }
        }

        function exitpop(){
            popUp.style.display = "none";
            confirmTch.removeEventListener("click", choosen);
            exitPop.removeEventListener("click", exitpop);
        }

        confirmTch.addEventListener("click", choosen);
        exitPop.addEventListener("click", exitpop);
    }   
});
