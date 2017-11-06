function start() {

    chrome.storage.local.get('data', function (store) {
        chrome.tabs.executeScript({ code: `window.location.toString()` }, function (tab) {

            var http = new XMLHttpRequest();
            http.onreadystatechange = function () {
                if (http.readyState == 4) {
                    if (http.status >= 200 && http.status < 300) {
                        var data = JSON.parse(http.responseText);
                        chrome.tabs.executeScript({ code: `var mydata = "${data.token}";` }, function () {
                            chrome.tabs.executeScript({ file: 'script.js' });
                        });
                    }
                    else {
                        alert("error!");
                    }
                }
            }

            if (!store.data) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        store.data = JSON.parse(xhr.responseText);
                    }
                };
                xhr.open("GET", chrome.extension.getURL('init.json'), false);
                xhr.send();
            }

            var url = tab.toString();
            var remote;

            for (let i = 0; i < store.data.environments.length; i++) {
                let env = store.data.environments[i];
                let re = new RegExp(env.match, "i");
                if (re.test(url)) {
                    remote = { env: env.name, method: env.method, url: env.url };
                    break;
                }
            }

            if (!remote) {
                alert("No match for current tab!");
                return;
            }

            let user = store.data.users.find(x => x.env === remote.env && x.isDefault === "true");

            if (!user) {
                alert(`Default user for '${remote.env}' is not found!`);
                return;
            }

            http.open(remote.method.toUpperCase(), remote.url, true);
            http.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            var req = {
                userName: user.login,
                password: user.pass,
                "productId": 0
            };

            http.send(JSON.stringify(req));
        });
    });
}

chrome.contextMenus.create({
    title: "Insert Token",
    contexts: ["editable"],
    onclick: start
});


