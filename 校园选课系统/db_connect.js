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
                        return res.json({success:true, redirect:"../main.html", username:db_user.user});
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
app.get("/api/adminStudentData", (req, resStd) => {
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
app.get("/api/adminTeacherData", (req, resTch) => {
    const tchSql = "SELECT * FROM teacher_info";

    db.query(tchSql, (err, results) => {
        if(err){
            console.err("查询错误 ： ", err);
            return resTch.status(500).json({success: false, message:"数据库查询失败"});
        }
        resTch.json({success: true, data: results});
    });
});

//激活用户
app.post("/api/userActivate", (req, res)=>{
    const {userId, oldPass, newPass} = req.body;
    const checkPass = "SELECT * FROM login_info WHERE id=? and password=?";
    const actUser = "UPDATE login_info SET password=? , active='1' WHERE id=?";

    db.query(checkPass, [userId, oldPass], (err, result)=>{
        console.log(result);
        if(err){
            return res.json({success:false, message:"数据库错误"});
        }
        if(result.length == 0){
            return res.json({success: false, message: "用户或密码错误"});
        }
        db.query(actUser, [newPass, userId], (err, result)=>{
            if(err){
                return res.json({success:false, message:"数据库错误"});
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
    const sql = req.body;

    db.query(sql, (err, result)=>{
        if(err){
            return res.json({success: false, message: "修改失败"});
        }
        res.json({success: true, message: "修改成功"});
    });
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
