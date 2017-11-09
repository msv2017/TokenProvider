function save_options() {

    let users = $("tr[user]").toArray().map(x => ({ user: $(x).attr('user'), order: $(x).attr('order') }));
    users = users.sort((a, b) => parseInt(a.order) - parseInt(b.order));
    let data = [];

    $.each(settings.environments.map(x => x.name), (i, env) => {
        $.each(users.map(x => x.user), (j, user) => {
            let login = $(`tr[user='${user}'] input#${env}_login`).val();
            let pass = $(`tr[user='${user}'] input#${env}_pass`).val();
            let isDefault = $(`tr[user='${user}']`).attr("default_user");
            data.push({ user: user, env: env, login: login, pass: pass, isDefault: isDefault });
        })
    });

    chrome.storage.local.set({ data: { users: data, environments: settings.environments } }, function () {
        setTimeout(function () {
            window.close();
        }, 0);
    });

    return false;
}

function restore_options() {
    chrome.storage.local.get('data', function (store) {

        $.each(settings.environments, (i, env) => $("thead tr").append(`<th colspan="2">${env.display}</th>`));
        $("thead tr").append("<th></th>");
        $("#controls").attr("colspan", (settings.environments.length + 1) * 2);

        let users = $.isEmptyObject(store) ? settings.users : store.data.users;

        $.each([...new Set(users.map(x => x.user))], (i, user) => add_controls_silent(user));

        $.each(users, (i, data) => {
            let user = data.user;
            let env = data.env;
            $(`tr[user="${user}"] input#${env}_login`).val(data.login);
            $(`tr[user="${user}"] input#${env}_pass`).val(data.pass);
            $(`tr[user="${user}"]`).attr("default_user", data.isDefault);
            let src = data.isDefault === "true" ? "square_checked.svg" : "square_empty.svg";
            $(`tr[user="${user}"] td img.check_default`).attr("src", `/assets/${src}`);
        });
    });
}

function export_settings() {
    chrome.storage.local.get('data', function (store) {

        let data = store.data;
        let content = JSON.stringify(data);
        let reader = new FileReader();
        let blob = new Blob([content]);
        reader.readAsDataURL(blob);
        reader.onload = function (e) {
            var save = document.createElement('a');
            save.href = e.target.result;
            save.target = '_blank';
            save.download = "init.json";

            var e = document.createEvent('Event');
            e.initEvent('click', true, true);
            save.click();
        };
    });
}

function import_settings() {
    var fileInput = document.createElement("input");
    fileInput.type = 'file';

    fileInput.addEventListener('change', function (e) {
        var f = e.target.files[0];
        if (f) {
            var reader = new FileReader();
            reader.onload = function (e) {
                let data = JSON.parse(e.target.result);

                chrome.storage.local.set({ data: { users: data.users, environments: data.environments } }, function () {
                    setTimeout(function () {
                        location.reload();
                    }, 0);
                });

            }
            reader.readAsText(f);
        }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
}

function get_inputs(user, env) {
    return `
<td login>
    <input id="${env.name}_login" type="text" placeholder="login">
</td>
<td pass>
    <input id="${env.name}_pass" type="text" placeholder="password">
</td>`;
}

function get_row(user) {
    return `
<tr user="${user}" order="${orderSeq++}" default_user="false">
    <td>
        <img class="check_default" src="/assets/square_empty.svg">&nbsp;
        <input class="edit_user" type="text" value="${user}">&nbsp;
    </td>
    ${settings.environments.map(env => get_inputs(user, env)).join('')}
    <td>
        <button type="button" class="remove pure-button">
            <img user="${user}" src="/assets/remove.svg">
        </button>
    </td>
</tr>
`;
}

function gen_user(name) {
    let n = 0;
    let user;
    while (true) {
        user = `${name || "user"}${n || ""}`;
        if (!document.querySelector(`tr[user='${user}']`)) {
            break;
        }
        n++;
    }

    return user;
}

function add_controls() {
    let user = gen_user("user");
    add_controls_silent(user);
    $(`tr[user='${user}'] input.edit_user`).focus().select();
}

function add_controls_silent(user) {
    $("tbody").append(get_row(user));
}

function remove_controls() {
    $(this).closest("tr").remove();
}

function set_default() {
    $("tr[user] td img.check_default").attr("src", "/assets/square_empty.svg");
    $(this).attr("src", "/assets/square_checked.svg");
    $("tr[user]").attr("default_user", "false");
    $(this).closest("tr").attr("default_user", "true");
}

function set_user() {
    let user = gen_user($(this).val());
    $(this).val(user);
    $(this).closest("tr").attr("user", user);
}

var orderSeq = 1;

$.getJSON("/init.json", (data) => {
    settings = data;
});

$(() => {
    restore_options();

    $(document).on("click", ".remove", remove_controls);
    $(document).on("click", ".check_default", set_default);
    $(document).on("change", ".edit_user", set_user);

    $("#save").on("click", save_options);
    $("#new").on("click", add_controls);
    $("#export").on("click", export_settings);
    $("#import").on("click", import_settings);
});