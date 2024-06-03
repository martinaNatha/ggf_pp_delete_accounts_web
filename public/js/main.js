var single = $(".single_main")
var multi = $(".multi_main")
var dataList;
var jsonData;

(function () {
    var preload = document.getElementById("preload");
    var bodycontent = document.getElementById("body-content");
    setTimeout(function () {
        preload.style.opacity = 0;
        setTimeout(function () {
            preload.style.display = "none";
        }, 1000);
        bodycontent.style.display = "block";
        setTimeout(function () {
            bodycontent.style.opacity = 1;
        }, 1000);
    }, 4000);
    getUserInfo();
})();

var user_name;
function getUserInfo() {
    var tokenEncrypt = sessionStorage.getItem("tokenusers");
    var tokenUser = JSON.parse(tokenEncrypt);
    user_name = tokenUser.name;
    document.getElementById("userName").innerText = user_name;
    document.getElementById("usName").innerText = '@' + tokenUser.username;
}


$('.tabs a').click(function (e) {
    e.preventDefault();
    $('.tabs a').removeClass('active');
    $(this).addClass('active');
    if ($(this).text() == 'Multiple') {
        single.removeClass('active_display');
        multi.addClass('active_display')
    } else {
        multi.removeClass('active_display');
        single.addClass('active_display')
    }
});

//reset account page
$('.retab a').click(function (e) {
    e.preventDefault();
    $('.retab a').removeClass('active');
    $(this).addClass('active');
    if ($(this).text() == 'WG') {
        single.removeClass('active_display');
        multi.addClass('active_display')
    } else {
        multi.removeClass('active_display');
        single.addClass('active_display')
    }
});

$('.ul-content ul li').click(function (e) {
    e.preventDefault();
    $('.ul-content ul li').removeClass('active');
    // $(this).addClass('active');
    if ($(this).text() == 'Reset Accounts') {
        $(".side_li1").removeClass('active');
        $(".side_li2").addClass('active');
        window.location.replace("/resetaccount");
    } else {
        $(".side_li1").addClass('active');
        $(".side_li2").removeClass('active');
        window.location.replace("/home");
    }
});

document.getElementById('excelwninput').addEventListener('change', handleFileSelect);

$("#excelwninput").on("change", function(){
    handleFileSelect;
})

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Define the header value you're looking for
        const headerValue = 'Mbr No'; // Replace with the actual header value you're looking for

        // Find the range of the data
        const range = XLSX.utils.decode_range(worksheet['!ref']);

        // Search for the target column by header value
        let targetColumn = -1;
        for (let c = range.s.c; c <= range.e.c; c++) {
            const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c });
            const cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : '';
            if (cellValue === headerValue) {
                targetColumn = c;
                break;
            }
        }

        if (targetColumn === -1) {
            Swal.fire({
                title: "Header Not Found",
                text: "The specified header value was not found in the sheet.",
                icon: "error"
            });
            return;
        }

        // Start reading from the second row (excluding the header row)
        range.s.r++;

        // Extract data from the target column (excluding the header row)
        const columnData = [];
        for (let i = range.s.r; i <= range.e.r; i++) {
            const cellAddress = XLSX.utils.encode_cell({ r: i, c: targetColumn });
            const cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : ''; // Get cell value (or empty string if cell is empty)
            columnData.push(cellValue);
        }

        // Check if any value does not start with 'A'
        const nonAValues = columnData.filter(value => !value.startsWith('A'));
        var emessage = document.getElementById("Emessage");
        var button = document.getElementById('multi_button');
        if (nonAValues.length > 0) {
            Swal.fire({
                title: "Something went wrong",
                text: "The format and column position is not correctly set, please check the excel sheet",
                icon: "error"
            });
            var computedStyle = window.getComputedStyle(emessage);
            var displayPropertyValue = computedStyle.getPropertyValue('display');
            if (displayPropertyValue === 'block') {
                emessage.style.display = 'none';
                button.disabled = true;
            }
            return;
        } else {
            emessage.style.display = 'block';
            button.disabled = false;
        }
        // Add the extracted data from the column to a list
        dataList = columnData.filter(Boolean); // Filter out empty values

        // Display the list in the console
        console.log(dataList);
        // send_data(dataList);
    };

    reader.readAsArrayBuffer(file);
}

$("#multi_button").on("click", function () {
    send_delete_data(dataList);
});

$("#single_button").on("click", function () {
    var single_a = document.getElementById("single_value").value;
    if(single_a == "" || single_a == null || !(single_a.startsWith('A'))){
        Swal.fire({
            title: "Error",
            text: "Please enter a valid Anumber",
            icon: "error"
        });
    }else{
        send_delete_data([single_a]);
    }
});

async function send_delete_data(data) {
    event.preventDefault();
   
    var amount = data.length;
    var data_info = {
        data,
        user_name,
        amount
    }
    const result = await fetch("/send_data_to_uipath", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data_info),
    }).then((res) => res.json());
    if(result.status == "202") {
        Swal.fire({
            title: "Success",
            text: "In a few minutes a confirmition email will be send to you, with more info",
            icon: "success"
        });
    }
}

let profile = document.querySelector('.profile');
let menu = document.querySelector('.menu');

profile.onclick = function () {
    menu.classList.toggle('active');
}

//reset actions
document.getElementById('excelwnres').addEventListener('change', resetedInfo);

function resetedInfo(event) {

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Define the column letter or index from which you want to extract data
        const targetColumn = '4'; // For example, extracting data from column B

        // Find the range of the data (excluding the header row)
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        range.s.r++; // Start reading from the second row

        // Extract data from the target column (excluding the header row)
        const columnData = [];
        for (let i = range.s.r; i <= range.e.r; i++) {
            const cellAddress = XLSX.utils.encode_cell({ r: i, c: targetColumn - 1 });
            const cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : ''; // Get cell value (or empty string if cell is empty)
            columnData.push(cellValue);
        }

        // Add the extracted data from the column to a list
        dataList = columnData.filter(Boolean); // Filter out empty values

        // Display the list in the console
        jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        // send_data(dataList);
    };

    reader.readAsArrayBuffer(file);
}

$("#resetwn_button").on("click", async function () {
    var data_info = {
        jsonData,
        user_name
    }
    const result = await fetch("/send_reseted_info", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data_info),
    }).then((res) => res.json());
    if (result.status == "202") {
        Swal.fire({
            title: "Success",
            text: "tur kos ta bon",
            icon: "success"
        });
    }
});

//reset actions
document.getElementById('excelwgres').addEventListener('change', resetedmultiInfo);

function resetedmultiInfo(event) {

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Define the column letter or index from which you want to extract data
        const targetColumn = '4'; // For example, extracting data from column B

        // Find the range of the data (excluding the header row)
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        range.s.r++; // Start reading from the second row

        // Extract data from the target column (excluding the header row)
        const columnData = [];
        for (let i = range.s.r; i <= range.e.r; i++) {
            const cellAddress = XLSX.utils.encode_cell({ r: i, c: targetColumn - 1 });
            const cellValue = worksheet[cellAddress] ? worksheet[cellAddress].v : ''; // Get cell value (or empty string if cell is empty)
            columnData.push(cellValue);
        }

        // Check if any value does not start with 'A'
        const nonAValues = columnData.filter(value => !value.startsWith('A'));
        var emessage = document.getElementById("Emessage");
        var button = document.getElementById('multi_button');
        if (nonAValues.length > 0) {
            Swal.fire({
                title: "Something went wrong",
                text: "The format and column position is not correct set, please check the excel sheet",
                icon: "error"
            });
            var computedStyle = window.getComputedStyle(emessage);
            var displayPropertyValue = computedStyle.getPropertyValue('display');
            if (displayPropertyValue === 'block') {
                emessage.style.display = 'none';
                button.disabled = true;
            }
            return;
        } else {
            emessage.style.display = 'block';
            button.disabled = false;
        }
        // Add the extracted data from the column to a list
        dataList = columnData.filter(Boolean); // Filter out empty values

        // Display the list in the console
        jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        // send_data(dataList);
    };

    reader.readAsArrayBuffer(file);

    // var input = document.getElementById('excelwnreset');
    // var file = input.files[0];
    // if (!file) {
    //   console.error('No file selected.');
    //   return;
    // }

    // var reader = new FileReader();
    // reader.onload = function(e) {
    //   var data = new Uint8Array(e.target.result);
    //   var workbook = XLSX.read(data, { type: 'array' });
    //   var sheetName = workbook.SheetNames[0];
    //   var worksheet = workbook.Sheets[sheetName];
    //   var jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    //   console.log(jsonData);
    // };
    // reader.readAsArrayBuffer(file);
}
