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
app.get("/api/admin/StudentData", (_, resStd) => {
    const stdSql = "SELECT * FROM student_info";

    db.query(stdSql, (err, results) => {
        if(err){
            console.err("查询错误 ： ", err);
            return resStd.status(500).json({success: false, message:"数据库查询失败"});
        }
        resStd.json({success: true, data: results});
    });
});

//获取教师的用户信息
app.get("/api/admin/TeacherData", (_, resTch) => {
    const tchSql = "SELECT * FROM teacher_info";

    db.query(tchSql, (err, results) => {
        if(err){
            console.err("查询错误 ： ", err);
            return resTch.status(500).json({success: false, message:"数据库查询失败"});
        }
        resTch.json({success: true, data: results});
    });
});

//获取登录信息
app.get("/api/admin/LoginData", (_, resLog) => {
    const logSql = "SELECT * FROM login_info";

    db.query(logSql, (err, results) => {
        if(err){
            console.err("查询错误 ：", err);
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
    console.log(table);

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
    console.log(req.body.sql);
    db.query(req.body.sql, (err, result)=>{        
        if(err){
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
// const courseDict = {};

app.get("/api/course/info", (req, res) => {
    const search = req.query.search || "";
    const courseInfoSql = "SELECT * FROM teacher_course WHERE course_name LIKE ? OR name LIKE ?";     
    const courseInfo = {};
    const course_name = new Set();
    const codes = new Set();
    const department = new Set();

    db.query(courseInfoSql, [`%${search}%`, `%${search}%`], (err, results) => {  
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

app.post("/api/selection/select", async (req, res) => {
    const select = req.body.selectedCourse;
    const studentId = req.body.studentId;
    const DATETIME = new Date();

    try {
        const validity = await validateSelection(Id=studentId, sessionTime=select.time, sessionDay=select.day, max_capacity=select.max_student, current_capacity=select.current_student);

        if(!validity.success){
            return res.json(validity);
        }

        const sql = "INSERT INTO student_course (student_id, course_code, select_time, teacher, status) VALUES (?, ?, ?, ?, ?)";        

        db.query(sql, [studentId, select.course_code, DATETIME, select.teacher, "已选"], (err) => {
            if(err) return res.json({success: false, message: err});
            res.json({success: true, message: validity.message});
        });
    }catch(err){
        res.status(500).json({success: false, message: err.message});
    }
});

async function validateSelection(Id, sessionTime, sessionDay, max_capacity, current_capacity){    
    
    if(Number(max_capacity) - Number(current_capacity) == 0){
        return {success: false, message: "课程已满"};
    }

    const stdClassSql = "SELECT * FROM student_course WHERE student_id = ?";
    const results = await queryValSelect(stdClassSql, [Id]);

    const TIME = {};

    for(const row of results){
        const tcSql = "SELECT course_name, time, day FROM teacher_course WHERE course_code = ? AND name = ?";
        const tc = await queryValSelect(tcSql, [row.course_code, row.teacher]);

        if(tc.length > 0){
            TIME[tc[0].course_name] = `${tc[0].day}${tc[0].time}`;
        }
    }

    for(const [courseName, T] of Object.entries(TIME)){
        if(T[0] === sessionTime){
            if(T === sessionTime){
                return {success: false, message: `与 ${courseName} 的时间冲突`};
            }

            if(T[0] === sessionTime[0] && T[1] === "A"){
                return {success: false, message: `与 ${courseName} 的时间冲突`};
            }
        }
    }
    return {success: true, message: "选课成功"};
};



app.get("/api/course/schedule/:id", async (req, res) => {
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
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
