document.addEventListener("DOMContentLoaded",async ()=>{
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

    userName.textContent = userGet ? userGet : "12345678901234567890";
    
    const schedule = document.getElementById('schedule');    
    const schBody = document.getElementById("schBody");
    const page = document.getElementById("pageNum");    
    
    // 更新显示函数
    function updateWeekDisplay() {
        schedule.querySelector(".week").innerHTML = `<th colspan="8"> 第 ${curW} 周 </th>`;
        page.innerText = curW;
        
        // 清空课表内容
        const tds = schBody.querySelectorAll('td');
        tds.forEach(td => td.innerHTML = '');
        
        // 重新加载数据
        fetch(`/api/course/schedule/${IDget}`)
            .then(res => res.json())
            .then(data => {
                data.data.forEach(row => {
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
});