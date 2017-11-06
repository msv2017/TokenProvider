# TokenProvider

This chrome extension was made to simplify usage of authentication token which can be obtained from your remote server.

The idea is that there is a remote server (or servers) that returns authentication token for provided user login and password.
And now imagine that we have different web sites where we need the token to enter manually (or copypaste from some web site which provides it). So, instead manual copy-pasting all the time you need the token you can install the extenstion and use right click context menu 'Insert Token' on editable element instead.

## How it works

When user perform right click on editable element (like textbox, textarea etc.), extension checks current tab's URL to match one of defined environments of default user, and if it succeed, sends the request to remote server as json:

    {
        userName: user.login,
        password: user.pass,
    }

And the server should response with following json as well:

    {
        token: "<something_here>"
    }
    
Once the token is got, the extension remove all text from selected control and insert actual token there.

## Installation

Before installation one should edit init.json file to add some environments there.
By default it contains one empty environment.

    {
        "name": "<name>", // environment name that used as reference on environment
        "display": "<text>", // display name which used only in options screen
        "method": "<method>", // POST or GET depends on your your remote server
        "url": "<remote_server>", // should be like http(s)://my.server.com/endpoint or whatever
        "match": "<regexp>" // matching regexp for this environment
    }
  
After environments are set one can add some default users associated with environment:

    {
        "user": "<text>", // used to differentiate users on options screen
        "env": "<name>", // one of environment names defined under 'environments' section
        "login": "<login>", // user's login name
        "pass": "<pass>", // user's password
        "isDefault": "<text>" // 'true' for default user and 'false' otherwise
    }
  
When init.json is ready do following in chrome itself:

    Chrome -> More Tools -> Extensions -> Load unpacked extension
