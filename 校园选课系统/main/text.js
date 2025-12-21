    const addStdBtn = document.getElementById("addStudent").querySelector("button");

    addStdBtn.addEventListener("click", (addUser)=>{
        addUser.preventDefault();
        addingS = true;
        const tableBody = document.getElementById("stdTabBody");
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td align="center"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td align="center"><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td><input type="text" style="width: 100%;"></td>
            <td align="center"><button class='submitAdd'> ✔ </button></td>`;
        tableBody.append(newRow);

        tableStd.querySelector(".submitAdd").addEventListener("click", async (subAdd)=>{
            const tr = subAdd.target.closest("tr");
            const newRowValues = Array.from(tr.querySelectorAll("input")).map(td => td.value);
            let allPass = true;

            for(let i=0; i<newRowValues.length; i++){
                if(newRowValues[i] == ""){
                    if(i == 6){
                        newRowValues[i] = "-";
                        continue;
                    }
                    allPass = false;
                    alert("connot null");
                    break;
                }
            }

            const addSql = `INSERT INTO student_info (name, id, gender, academy, class, phone_number, email, degree) VALUES ('${newRowValues[0]}', '${newRowValues[1]}', '${newRowValues[2]}', '${newRowValues[3]}', '${newRowValues[4]}', '${newRowValues[5]}', '${newRowValues[6]}', '${newRowValues[7]}')`;            
            const res = await fetch("/api/addUser/std", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({sql: addSql})
            });
            const result = await res.json();
            alert(result.message);
            if(result.success){
                location.reload();
            }
        });        
    });