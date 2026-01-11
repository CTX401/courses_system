// window.setInterval("get_size()")
// var windowHeight = 0;
// var windowWidth = 0;

// function get_size(){
//     windowHeight = window.innerHeight;
//     windowWidth = window.innerWidth;
//     // isbiggerthan();
// }

// function say(){
//     alert("Height = " + windowHeight + "      " + "Width = " + windowWidth);
// }

// function isbiggerthan(){
//     const child = document.getElementById('a');
//     const size = child.getBoundingClientRect();
//     const childHeight = size.height;
//     const childWidth = size.width;
//     const para = document.getElementById('para');
//     if(windowHeight < childHeight || windowWidth < childWidth){
//         para.textContent = "主窗口小于子窗口";
//     }
//     else{
//         para.textContent = "主窗口大于子窗口"
//     }
// }

document.getElementById("dataForm").addEventListener('submit', function() {
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;

    const data = {
        name: name,
        password: password
    };

    fetch('PHP/test.php', {
        method: 'POST',
        headers:{
            'Content-Type': "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(Response => Response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {        
    })
    .catch(error => {console.error("提交失败：", error)        
    });
});
