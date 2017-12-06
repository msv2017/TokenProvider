function save(closeWindow) {

    let envs = [];

    $.each($('tr[env]'), (i, tr) => {
        let env = {};
        $.each($('input', tr), (j, input) => {
            let name = $(input).attr('name');
            let value = $(input).val();
            env[name] = value;
        });
        envs.push(env);
    });

    settings.environments = envs;

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
            if (closeWindow)
                window.close();
        }, 0);
    });

    return false;
}

function users_header(envs) {
    return `
    <thead>
        <tr>
            <th></th>
            <th>User</th>
            ${envs.map(x => `<th colspan='2'>${x.display}</th>`).join()}
            <th></th>
        </tr>
    </thead>
    <tbody></tbody>
    `;
}

function envs_header(envs) {
    return `
    <thead>
        <tr>
            <th>Name</th>
            <th>Display</th>
            <th>Method</th>
            <th>Url</th>
            <th>Match</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        ${envs.map(x => row_env(x)).join()}
    </tbody>
    `;
}

function update() {
    chrome.storage.local.get('data', function (store) {

        if ($.isEmptyObject(store))
            store = settings;
        else {
            store = store.data;
        }

        //  alert(JSON.stringify(store, null, 2));

        $('table#users').empty();
        $('table#users').append(users_header(store.environments));
        $("#controls").attr("colspan", (store.environments.length + 1) * 2);

        let users = store.users;

        $.each([...new Set(users.map(x => x.user))], (i, user) => add_user(store.environments, user));

        $.each(users, (i, data) => {
            let user = data.user;
            let env = data.env;
            $(`tr[user="${user}"] input#${env}_login`).val(data.login);
            $(`tr[user="${user}"] input#${env}_pass`).val(data.pass);
            $(`tr[user="${user}"]`).attr("default_user", data.isDefault);
            let src = data.isDefault === "true" ? "square_checked.svg" : "square_empty.svg";
            $(`tr[user="${user}"] td img.check_default`).attr("src", `/assets/${src}`);
        });

        $('table#envs').empty();
        $('table#envs').append(envs_header(store.environments));

        adjust_inputs();
    });
}

function adjust_inputs() {
    $('input').each((i, el) => {
        $(el).after('<span class="fitter" style="display:none"></span>');
        let span = $(el).siblings('span.fitter').first();
        span.text($(el).val() || $(el).attr('placeholder'));
        let size = span.width();
        $(el).css("width", size);
    });
}

function row_env({ name, display, method, url, match } = {}) {
    let index = envSeq++;
    return `
    <tr env>
    <td><input name="name" order=${index} type="text" placeholder="name" value="${name || ''}"></td>
    <td><input name="display" order=${index} type="text" placeholder="display" value="${display || ''}"></td>
    <td><input name="method" order=${index} type="text" placeholder="method" value="${method || ''}"></td>
    <td><input name="url" order=${index} type="text" placeholder="url" value="${url || ''}"></td>
    <td><input name="match" order=${index} type="text" placeholder="match" value="${match || ''}"></td>
    <td>
        <button type="button" class="remove pure-button tooltip">
            <span class="tooltiptext">Delete</span>
            <img src="/assets/remove.svg">
        </button>
    </td>
    </tr>
    `;
}

function export_data() {
    chrome.storage.local.get('data', function (store) {

        let data = store.data;
        let content = JSON.stringify(data);
        let reader = new FileReader();
        let blob = new Blob([content]);
        reader.readAsDataURL(blob);
        reader.onload = function (e) {
            var save = document.createElement('a');
            save.id = 'export';
            save.href = e.target.result;
            save.target = '_blank';
            save.download = "init.json";

            var e = document.createEvent('Event');
            e.initEvent('click', true, true);
            save.click();
        };
    });
}

function import_data() {
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

    $(fileInput).remove();
}

function user_login_pass(user, env) {
    return `
<td login>
    <input id="${env.name}_login" type="text" placeholder="login">
</td>
<td pass>
    <input id="${env.name}_pass" type="text" placeholder="password">
</td>`;
}

function row_user(envs, user) {
    return `
<tr user="${user}" order="${userSeq++}" default_user="false">
    <td>
        <img class="check_default" src="/assets/square_empty.svg">
    </td>
    <td>
        <input class="edit_user" type="text" value="${user}">
    </td>
    ${envs.map(env => user_login_pass(user, env)).join('')}
    <td>
        <button type="button" class="remove pure-button tooltip">
            <span class="tooltiptext">Delete</span>
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

function add_row() {
    if ($("table#users").is(":visible")) {
        chrome.storage.local.get('data', function (store) {
            if ($.isEmptyObject(store))
                store = settings;
            else {
                store = store.data;
            }

            let user = gen_user("user");

            $("table#users tbody").append(row_user(store.environments, user));

            adjust_inputs();

            $(`tr[user='${user}'] input.edit_user`).focus().select();
        });
    }

    if ($("table#envs").is(":visible")) {
        $("table#envs tbody").append(row_env());
        adjust_inputs();
    }
}

function add_user(envs, user) {
    $("table#users tbody").append(row_user(envs, user));
}

function remove_row() {
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

function tab_click() {
    $(".pure-menu-item").removeClass("pure-menu-selected");
    $(this).closest("li").addClass("pure-menu-selected")
    $("table").hide();
    $(`#${$(this).attr("tab")}`).show();

    save();
    update();
}

let envSeq = 1;
let userSeq = 1;

$.getJSON("/init.json", (data) => {
    settings = data;
});

$(() => {
    $(document).on("keypress", 'input[type="text"]', (function (e) {
        if (e.which !== 0 && e.charCode !== 0) {
            var c = String.fromCharCode(e.keyCode | e.charCode);
            let span = $(this).siblings('span.fitter').first();
            let text = ($(this).val() + c) || $(this).attr('placeholder');
            span.text(text);
            let size = span.width();
            $(this).css("width", size);
        }
    }));

    $(document).on("change paste keyup", 'input[type="text"]', (function () {
        let span = $(this).siblings('span.fitter').first();
        span.text($(this).val() || $(this).attr('placeholder'));
        let size = span.width();
        $(this).css("width", size);
    }));

    $(document).on("click", ".remove", remove_row);
    $(document).on("click", ".check_default", set_default);
    $(document).on("click", ".pure-menu-link", tab_click);
    $(document).on("change", ".edit_user", set_user);

    $("#save").on("click", save);
    $("#new").on("click", add_row);
    $("#export").on("click", export_data);
    $("#import").on("click", import_data);

    update();
});