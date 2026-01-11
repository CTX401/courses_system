const express = require("express");
const mysql = require("mysql2");
const path = require("path");
// const bodyParser = require("body-parser");
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("main"));

// 数据库连接
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Tian1027#",
  database: "courses_selection_system"
});

db.connect(err => {
    if(err) throw err;
    console.log("connected! !");
});

// 登陆界面
app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "main","login.html"));
});
//登录
app.post("/submit", (req, res) =>{
    const {user, password} = req.body;
    const sql = "SELECT * FROM login_info WHERE id = ?";
    
    db.query(sql, [user], (err, results)=>{
        if (err) throw err;

        if (results.length === 0){
            console.log(results);
            return res.json({success:false, message:"用户名或密码错误"});
        }else{
            const db_user = results[0];
            if(db_user.password === password && db_user.active === 1){                
                console.log("登陆成功");
                console.log(db_user.id);
                if(db_user.user === "admin"){      
                    return res.json({success:true, redirect:"../mainAdmin.html", username:db_user.user});
                }else{
                    if(db_user.id[0] == "T"){
                        return res.json({success:true, redirect:"../mainTeacher.html", username:db_user.user});    
                    }else{
                        return res.json({success:true, redirect:"../mainStudent.html", username:db_user.user});
                    }                
                }
            }else{
                return res.json({success:false, message:"用户名或密码错误"});
            }
        }
    });
});

// 主页(admin)
// 获取学生的用户信息
app.get("/api/admin/StudentData", (req, resStd) => {
    const search = req.query.search;

    var stdSql = new String();
    if(search == ""){
        stdSql = "SELECT * FROM student_info";
    }else{
        stdSql = `SELECT * FROM student_info WHERE name LIKE "%${search}%" OR id LIKE "%${search}%"`;
    }
    db.query(stdSql, (err, results) => {
        if(err){
            console.log("查询错误 ： ", err);
            return resStd.status(500).json({success: false, message:"数据库查询失败"});
        }
        resStd.json({success: true, data: results});
    });
});

//获取教师的用户信息
app.get("/api/admin/TeacherData", (req, resTch) => {
    const search = req.query.search;

    var tchSql = new String();
    if(search == ""){
        tchSql = "SELECT * FROM teacher_info";
    }else{
        tchSql = `SELECT * FROM teacher_info WHERE name LIKE "%${search}%" OR id LIKE "%${search}%"`;
    }

    db.query(tchSql, (err, results) => {
        if(err){
            console.log("查询错误 ： ", err);
            return resTch.status(500).json({success: false, message:"数据库查询失败"});
        }
        resTch.json({success: true, data: results});
    });
});

//获取登录信息
app.get("/api/admin/LoginData", (req, resLog) => {
    const search = req.query.search;

    var logSql = new String();
    if(search == ""){
        logSql = "SELECT * FROM login_info";
    }else{
        logSql = `SELECT * FROM login_info WHERE user LIKE "%${search}%" OR id LIKE "%${search}%"`;
    }

    db.query(logSql, (err, results) => {
        if(err){
            console.log("查询错误 ：", err);
            return resLog.status(500).json({success: false, message:"数据库查询失败"});
        }
        resLog.json({success: true, data: results});
    });
});

//激活用户
app.post("/api/userActivate", (req, res)=>{
    const {userId, oldPass, newPass} = req.body;
    const checkPass = "SELECT * FROM login_info WHERE id=? and password=?";
    const actUser = "UPDATE login_info SET password=? , active='1' WHERE id=?";

    db.query(checkPass, [userId, oldPass], (err, result)=>{
        // console.log(result);
        if(err){
            return resLog.status(500).json({success:false, message:"数据库错误"});
        }
        if(result.length == 0){
            return res.json({success: false, message: "用户或密码错误"});
        }
        db.query(actUser, [newPass, userId], (err, result)=>{
            if(err){
                return resLog.status(500).json({success:false, message:"数据库错误"});
            }
            res.json({success: true, message:"账号成功激活"});
        });
    });
});

//删除用户
app.post("/api/dltUser", (req, res)=>{
    const userId = req.body.id;
    const dltLogin = "DELETE FROM login_info WHERE id = ?";
    let table = "";

    if(userId[0] === "T") table = "teacher_info";
    else table = "student_info";
    // console.log(table);

    db.query(dltLogin, [userId], (err, result)=>{
        if(err){
            return res.json({success: false, message: "用户删除失败!"});
        }
        const dltSql = `DELETE FROM ${table} WHERE id = ?`;
        db.query(dltSql, [userId], (err2, result2)=>{
            if(err2){
                return res.json({success: false, message: "用户删除失败!!"});
            }
            res.json({success: true, message:"成功删除用户"});
        });
    });

});

//修改用户数据
app.post("/api/editUser", (req, res) =>{
    // console.log(req.body.sql);
    db.query(req.body.sql, (err, result)=>{        
        if(err){
            console.log(err);
            return res.json({success: false, message: "修改失败"});
        }
        res.json({success: true, message: "成功修改"});
    });
});

//添加用户
app.post("/api/addUser", (req, res) => {
    db.query(req.body.sql, (err, result)=>{
        if(err) return res.json({success: false, message: "添加失败"});

        db.query(req.body.logSql, (err, results) => {
            if(err) return res.json({success: false, message: "添加失败"});        
            res.json({success: true, message: "成功添加"});
        });       
    });
});

// 获取课程信息
app.get("/api/course/info", (req, res) => {
    const search = req.query.search || "";
    const option = req.query.option || "";
    const courseInfoSql = "SELECT * FROM teacher_course WHERE course_name LIKE ? OR name LIKE ?";     
    const courseInfo = {};
    const course_name = new Set();
    const codes = new Set();
    const department = new Set();

    db.query(courseInfoSql, [`%${search}%`, `%${search}%`, `%${option}%`], (err, results) => {  
        if(err) return res.status(500).json({error: err, message: "无法获取课程数据"});  
        results.forEach(name => {
            course_name.add(name.course_name);
        });

        results.forEach(row => {
            codes.add(row.course_code);
        });

        codes.forEach(code => {
            courseInfo[code] = new Array();
        });

        results.forEach(row => {   
            courseInfo[row.course_code].push({
                teacher: row.name,
                course_name: row.course_name,
                course_code: row.course_code,
                department: row.department,
                time: row.time,
                classroom: row.classroom, 
                credit: row.credit,         
                current_student: row.current_student,
                max_student: row.max_student,
                day: row.day
            });
            department.add(row.department);
        });
        // console.log(courseInfo);
        res.json({success: true, data: courseInfo, department: Array.from(department), course_name: Array.from(course_name)});
    });       
});

//选课
app.post("/api/selection/select", async (req, res) => {
    const select = req.body.selectedCourse;
    const studentId = req.body.studentId;
    const DATETIME = new Date();

    const validity = await validateSelection(Id=studentId, sessionTime=select.time, sessionDay=select.day, max_capacity=select.max_student, current_capacity=select.current_student);

    if(validity.success){
        const sql = "INSERT INTO student_course (student_id, course_code, select_time, teacher, status) VALUES (?, ?, ?, ?, ?)";        
        db.query(sql, [studentId, select.course_code, DATETIME, select.teacher, "已选"], (err) => {
            if(err) {
                // console.log(err);
                return res.json({success: false, message: err})
            };
            const addCountSQL = `UPDATE teacher_course SET current_student = current_student + 1 WHERE course_code = ? AND \`name\` = ? AND department = ?`;    
            db.query(addCountSQL, [select.course_code, select.teacher, select.department], (err, _) => {
                if(err){
                    return res.json({success: false, message: "添加人数失败"});
                }
            });
            res.json({success: true, message: validity.message});
        });            
    }else{
        return res.json(validity);
    }
});

//验证合格性
async function validateSelection(Id, sessionTime, sessionDay, max_capacity, current_capacity){    
    
    if(Number(max_capacity) - Number(current_capacity) <= 0){
        return {success: false, message: "课程已满"};
    }
    // console.log(`${Id} ${sessionDay} ${sessionTime}`);
    const stdClassSql = "SELECT * FROM student_course WHERE student_id = ?";
    const results = await queryValSelect(stdClassSql, [Id]);
    // console.log(results);
    const TIME = {};

    for(const row of results){
        const tcSql = "SELECT course_name, time, day FROM teacher_course WHERE course_code = ? AND name = ?";
        const tc = await queryValSelect(tcSql, [row.course_code, row.teacher]);

        if(tc.length > 0){
            TIME[tc[0].course_name] = `${tc[0].day}${tc[0].time}`;
        }
    }

    for(const [courseName, T] of Object.entries(TIME)){
        // console.log(T.slice(1,));
        // console.log(`${courseName} : `)
        // console.log(`${T[0]} = ${sessionDay} : ${T[0] === sessionDay}`);
        // console.log(`${T[1]} = ${sessionTime[0]} : ${T[1] === sessionTime[0]}`);
        // console.log(`${T[2]} = ${sessionTime[1]} : ${T[2] === sessionTime[1]}`);
        // console.log("__________________________");
    
        if(T[0] === sessionDay){
            if(T.slice(1,) === sessionTime){
                return {success: false, message: `与${courseName}的时间冲突`}
            }else{
                if(T[1] === sessionTime[0] && T[2] === "A"){
                    return {success: false, message: `与 ${courseName} 的时间冲突`};
                }
            }        
        }
    }
    return {success: true, message: "选课成功"};
};

//获取学生课表
app.get("/api/student/schedule/:id", async (req, res) => {
    const schedSql = "SELECT * FROM student_course WHERE student_id = ?";    
    const userID = req.params.id;
    const results = await queryValSelect(schedSql, [userID]);
    const schedule = new Array();

    for(const row of results){
        const tcSql = "SELECT * FROM teacher_course WHERE course_code = ? AND name = ?";
        const tc = await queryValSelect(tcSql, [row.course_code, row.teacher]);        
        schedule.push(tc[0]);
    }    
    res.json({success: true, data: schedule});
});

function queryValSelect(sql, params=[]){
    return new Promise((resolve, reject) => {
        db.query(sql, params ,(err, results) => {
            if(err) reject(err);
            else resolve(results);
        });
    });
}

//获取教师课表
app.get("/api/teacher/courses/:id", (req, res) => {
    const tchId = req.params.id
    const tchCourseSql = "SELECT * FROM teacher_course WHERE ID = ?";
    db.query(tchCourseSql, [tchId], (err, results) => {
        if(err) return res.json({success: false, message: "查询失败"});
        res.json({success: true, data: results});
    });
});

//删除课程请求
app.post("/api/teacher/deleteRequest", (req, res) => {
    const course_code = req.body.CODE;
    const date = req.body.DATE;
    const reason = req.body.REASON;
    const ID = req.body.ID;
    const NAME = req.body.NAME;
    const COURSE = req.body.COURSE;
    const sql = "INSERT INTO teacher_request (teacher_name, teacher_ID, type, date, request, `condition`, `read`) values (?, ?, ?, ?, ?, ?, ?)";
    const request = JSON.stringify({"reason": reason, "course_code": course_code, "course_name": COURSE});

    db.query(sql, [NAME, ID, "删除课程", date, `${request}`, '待处理', "unread"], (err, _) => {
        if(err) {
            console.log(err);
            return res.json({success: false, message: "请求发送失败"});
        }
        res.json({success: true, message: "请求发送成功"});
    });
});

//添加课程请求
app.post("/api/teacher/addRequest", (req, res) => {
    const data = req.body.data;
    const ID = req.body.ID;
    const date = req.body.DATE;
    const NAME = req.body.NAME;
    const sql = `INSERT INTO teacher_request (teacher_name, teacher_ID, type, date, request, \`condition\`, \`read\`) values (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [NAME, ID, "添加课程", date, `${data}`, "待处理", "unread"], (err, _) => {
        if(err) {
            console.log(err);
            return res.json({success: false, message: "请求发送失败"});
        }
        res.json({success: true, message: "请求发送成功"});
    });
});

//管理员读取课程信息
app.get("/api/admin/courses", (req, res) => {
    const search = req.query.search || "";
    const option = req.query.option || "";
    const sql = "SELECT * FROM teacher_course WHERE course_name LIKE ? AND department LIKE ?";
    const department = new Set();

    db.query(sql, [`%${search}%`, `%${option}%`], (err, results) => {
        if(err) return res.json({success: false, message: "数据库读取失败"});
        results.forEach(r => {
            department.add(r.department);
        })
        res.json({success: true, data: results, department: Array.from(department)});
    });
});

//管理员删除课程
app.post("/api/admin/dltCourse", (req, res) => {
    const code = req.body.CODE;
    const teacher = req.body.teacher;
    const SQL = "DELETE FROM teacher_course WHERE course_code = ? AND name = ?";

    db.query(SQL, [code, teacher], (err, _) => {
        if(err) return {success: false, message: "删除课程失败"}
        res.json({success: true, message: "成功删除课程"});
    });
});

//管理员获取请求数据
app.get("/api/admin/requestInfo", (req, res) => {
    const search = req.query.search || "";
    const Type = req.query.Type || "";
    const SQL = "SELECT * FROM teacher_request WHERE teacher_name LIKE ? AND type LIKE ?";
    const typeList = new Set();
    db.query(SQL, [`%${search}%`, `%${Type}%`], (err, results) => {
        if(err) return res.json({success: false, message: "数据库读取失败"});
        results.forEach(row => {
            typeList.add(row.type);
        });
        res.json({success: true, data: results, typeList: Array.from(typeList)});
    });
});

//验证冲突
app.post("/api/admin/validating/conflict", (req, res) => {
    const classroom = req.body.classroom;
    const day = req.body.day;
    const time = req.body.time;
    const checkSQL = "SELECT * FROM teacher_course WHERE time = ? AND day = ? AND classroom = ?";
    let pass = false;

    db.query(checkSQL, [time, day, classroom], (err, results) => {
        if(err) return res.json({success:false, message: "读取失败"});
        if(results.length == 0){
            pass = true;
        }
        res.json({success: true, data: pass});
    });
});

//验证容量
app.post("/api/admin/validating/capacity", (req, res) => {
    const classroom = req.body.classroom;
    const capacity = req.body.capacity;
    const checkSQL = "SELECT capacity FROM classroom_capacity WHERE classroom = ?";
    let pass = false; 

    db.query(checkSQL, [classroom], (err, results) => {
        if(err) return res.json({success: false, message: "读取失败"});
        // console.log(results);
        const maxCap = Number(results[0].capacity);
        if(maxCap >= capacity){
            pass = true;
        }
        res.json({success: false, data: pass});
    });
});

//验证重叠
app.post("/api/admin/validating/duplicate", (req, res) => {
    const code = req.body.course_code;
    const teacherID = req.body.teacherId;
    const checkSQL = "SELECT * FROM teacher_course WHERE name = ? AND course_code = ?";
    let pass = false;

    db.query(checkSQL, [teacherID, code], (err, results) => {
        if(err) return res.json({success: false, message: "读取失败"});
        if(Object.keys(results).length == 0){
            pass = true;
        }
        res.json({success: true, data: pass});
    });
});

//拒绝添加课程请求
app.post("/api/admin/request/rejectAdd", (req, res) => {
    const ID = req.body.teacherId;
    const DATE = req.body.DATE;
    const REASON = req.body.REASON;
    const rejSQL = "UPDATE teacher_request SET `condition` = ? WHERE teacher_ID = ? AND date = ?";

    const condition = JSON.stringify({"decision":"驳回", "reason": `${REASON}`});

    db.query(rejSQL, [condition, ID, DATE], (err, _) => {
        if(err){return res.json({success: false, message: "发送失败"})};                
        res.json({success: true, message: "发送成功"});
    });
});

//拒绝删除课程请求
app.post("/api/admin/request/rejectDel", (req, res) => {
    const ID = req.body.ID;
    const DATE = req.body.DATE;
    const TYPE = req.body.TYPE;
    const rejDelSQL = "UPDATE teacher_request SET `condition` = ? WHERE teacher_ID = ? AND date = ? AND type = ?";
    const condition = JSON.stringify({"decision": "驳回"});

    db.query(rejDelSQL, [condition, ID, DATE, TYPE], (err, _) => {
        if(err) return res.json({success: false, message: "发送失败"});
        res.json({success: true, message: "发送成功"});
    });
});

//同意请求
app.post("/api/admin/request/approved", (req, res) => {
    const ID = req.body.teacherID;
    const DATE = req.body.DATE;
    const condition = JSON.stringify({"decision": "通过"});
    const approveSQL = "UPDATE teacher_request SET `condition` = ? WHERE teacher_ID = ? AND date = ?";
    var executeSQL = new String();

    db.query(approveSQL, [condition, ID, DATE], (err, _) => {
        if(err) return res.json({success: false, message: "发送失败"});
        const getData = "SELECT * FROM teacher_request WHERE teacher_ID = ? AND date = ?";
        db.query(getData, [ID, DATE], async (err, results2) => {
            if(err){return res.json({success: false, message: "查询失败"});}
            const reqType = results2[0].type;
            const executeData = JSON.parse(results2[0].request);
            var params = [];
            if(reqType == "删除课程"){
                executeSQL = "DELETE FROM teacher_course WHERE ID = ? AND course_code = ?";
                params = [ID, executeData.course_code];                
            }else if(reqType == "添加课程"){    
                const getCode = await queryValSelect("SELECT course_code FROM courses WHERE course = ?", [executeData.course_name]);
                const course_code = getCode[0].course_code;
                const time = `${executeData.session}${executeData.mode}`;
                executeSQL = "INSERT INTO teacher_course (name, course_name, course_code, department, time, classroom, credit, max_student, day, ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                params = [results2[0].teacher_name, executeData.course_name, course_code, executeData.department, time, executeData.location, executeData.credit, executeData.capacity, executeData.day, ID];
            }         
            db.query(executeSQL, params, (err, _) => {
                if(err){
                    console.log(err);
                    return res.json({success: false, message: "执行失败"});
                }
                res.json({success: true, message: "操作成功执行"});
            });
        });
    });
});

//获取课程
app.get("/api/course/courses", (req, res) => {
    const getCourseSQL = "SELECT * FROM courses";
    db.query(getCourseSQL, (err, results) => {
        if(err) return res.json({success: false, message: "获取失败"});
        res.json({success: true, data: results});
    });
});

//教师读取通知
app.get("/api/teacher/notification", (req, res) => {
    const ID = req.query.ID;
    const notiSQL = "SELECT * FROM teacher_request WHERE teacher_ID = ?";

    db.query(notiSQL, [ID], (err, results) => {
        if(err) return res.json({success: false, message: "获取通知失败"});
        res.json({success: true, data: results});
        // console.log(results);        
    });
});

//教师已读通知
app.post("/api/teacher/clear_notification", (req, res) => {
    const ID = req.body.tchId;
    const DATE = req.body.DATE;
    const notiSQL = "UPDATE teacher_request SET `read` = ? WHERE teacher_ID = ? AND date = ?";

    db.query(notiSQL, ["read", ID, DATE], (err, _) => {
        if(err) return res.json({success: false});
        res.json({success: true});
    });
});

//学生退课
app.post("/api/student/unsubCourse", (req, res) => {
    const course_code = req.body.courseCode;
    const studentId = req.body.studentID;
    const teacherName = req.body.teacherName;

    const unsubSQL = "DELETE FROM student_course WHERE course_code = ? AND student_id = ? AND teacher = ?";

    db.query(unsubSQL, [course_code, studentId, teacherName], (err, _) => {
        if(err) return res.json({success: false, message: "退课失败"});
        const removeCountSQL = `UPDATE teacher_course SET current_student = current_student - 1 WHERE course_code = ? AND \`name\` = ?`;
        db.query(removeCountSQL, [course_code, teacherName], (err, results) => {
            if(err){
                return res.json({success: false, message: "删减人数失败"})
            }
        });
        res.json({success: true, message: "成功退课"});
    });
});

//教师获取学生信息
app.post("/api/teacher/checkStudent", (req, res) => {
    const course_code = req.body.course_code;
    const teacherName = req.body.teacherName;
    const getSQL = "SELECT student_id FROM student_course WHERE course_code = ? AND teacher = ?";
    const idList = new Array();

    db.query(getSQL, [course_code, teacherName], (err, results) => {
        if(err){
            return res.json({success: false, message: "获取失败"});
        }
        results.forEach(result => {
            idList.push(result.student_id);
        });

        const placeholders = idList.map(() => '?').join(',');
        const detailSQL = `SELECT * FROM student_info WHERE id IN (${placeholders})`;
        console.log(idList);
        // console.log(detailSQL.length);
        db.query(detailSQL, idList, (err, results2) => {
            if(err){
                return res.json({success: false, data:[]});
            }
            console.log(Object.values(results2).length);
            res.json({success: true, data: results2});
        });        
    });
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});

