// 定義全域變數
let courseTypes = [
    { name: "一般", color: "#ffffff" }, // 預設一個白色背景
    { name: "必修", color: "#ffcccc" },
    { name: "選修", color: "#ccffcc" }
];

// 1. 初始化：當頁面載入完成後執行
window.onload = function() {
    generateTable();      // 產生課表格子
    renderTypeOptions();  // 產生類型選單
};

// 2. 自動產生 1-8 節的表格 HTML
function generateTable() {
    const tbody = document.getElementById("scheduleBody");
    tbody.innerHTML = ""; // 清空
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    for (let i = 1; i <= 8; i++) {
        let row = document.createElement("tr");
        
        // 第一格：顯示節次
        let periodCell = document.createElement("td");
        periodCell.innerText = `第 ${i} 節`;
        periodCell.style.backgroundColor = "#f0f0f0";
        row.appendChild(periodCell);

        // 接下來五格：星期一到五
        days.forEach(day => {
            let cell = document.createElement("td");
            // 設定 ID 格式為 "Mon_1", "Tue_2" 等
            cell.id = `${day}_${i}`;
            cell.onclick = function() { alert(`這是 ${day} 第 ${i} 節`); }; // 點擊測試用
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    }
}

// 3. 更新下拉選單
function renderTypeOptions() {
    const select = document.getElementById("courseTypeSelect");
    select.innerHTML = '<option value="">請選擇類型</option>';

    courseTypes.forEach((type, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.text = type.name;
        option.style.backgroundColor = type.color;
        select.appendChild(option);
    });
}

// 4. 新增類型的功能
function addNewType() {
    const nameInput = document.getElementById("newTypeName");
    const colorInput = document.getElementById("newTypeColor");
    
    const name = nameInput.value.trim();
    const color = colorInput.value;

    if (!name) return alert("請輸入類型名稱");

    courseTypes.push({ name, color });
    renderTypeOptions();
    
    // 自動選中剛新增的那個
    document.getElementById("courseTypeSelect").value = courseTypes.length - 1;
    nameInput.value = "";
}

// 5. 主功能：加入課程 (含衝堂檢查)
function addCourse() {
    const name = document.getElementById("courseName").value.trim();
    const day = document.getElementById("daySelect").value;
    const period = document.getElementById("periodSelect").value;
    const typeIndex = document.getElementById("courseTypeSelect").value;

    if (!name) return alert("請輸入課程名稱！");
    if (typeIndex === "") return alert("請選擇課程類型！");

    // 組合 ID 來尋找格子
    const cellId = `${day}_${period}`;
    const cell = document.getElementById(cellId);

    if (!cell) return alert("系統錯誤：找不到格子 " + cellId);

    // 取得選到的顏色
    const selectedColor = courseTypes[typeIndex].color;

    // 衝堂檢查
    if (cell.innerText.trim() !== "") {
        const userCheck = confirm(
            `【衝堂警告】\n\n${day} 第 ${period} 節已經有：「${cell.innerText}」\n\n確定要覆蓋嗎？`
        );
        if (!userCheck) return; // 如果按取消，就結束函數
    }

    // 寫入課程與顏色
    cell.innerText = name;
    cell.style.backgroundColor = selectedColor;
    cell.style.color = "#000"; // 文字黑色
}