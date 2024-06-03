$("#log_buton").on("click", async function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const result = await fetch("/login_cred", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    }).then((res) => res.json());
    if (result.status == "202") {
        // var json_user = {"name":result.data}
        // console.log(json_user);
        sessionStorage.setItem("tokenusers", JSON.stringify(result.data));
        window.location = '/home';
    } else {
        Swal.fire({
            title: "Error",
            text: result.msg,
            icon: "error"
        });
    }
});

let passwordInput = document.getElementById('password'),
    toggle = document.getElementById('btnToggle'),
    icon = document.getElementById('eyeIcon');

$(".toggle").click(function () {

    $(this).toggleClass("fa-eye fa-eye-slash");
    var input = passwordInput.type;
    if (input == "password") {
        passwordInput.type = 'text'
    } else {
        passwordInput.type = 'password'
    }
});