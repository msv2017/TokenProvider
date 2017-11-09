function init() {
    chrome.storage.local.get('data', function (store) {
        let users = [];
        for (let user of store.data.users) {
            if(users.find(x=> x === user.user))
                continue;
            users.push(user.user);
            $("#placeholder").append(user_template(user));
        }
    });
}

function user_template(user) {
    let b = user.isDefault === "true";
    return `
<div id="${user.user}" class="user">
    <img src="/assets/square_${b ? "checked" : "empty"}.svg"><span>${user.user}</span>
</div>`;
}

function user_click() {

    let current_user = $(this).attr("id");
    $("img").attr("src", "/assets/square_empty.svg");
    $(`#${current_user} img`).attr("src", "/assets/square_checked.svg");

    chrome.storage.local.get('data', function (store) {

        for (let user of store.data.users) {
            user.isDefault = user.user === current_user ? "true" : "false";
        }

        chrome.storage.local.set({ data: { users: store.data.users, environments: settings.environments } }, function () {
            setTimeout(function () {
                window.close();
            }, 0);
        });

    });
}

$.getJSON("/init.json", (data) => {
    settings = data;
});

$(() => {
    init();

    $(document).on("click", ".user", user_click);
});