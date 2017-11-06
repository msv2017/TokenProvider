# TokenProvider

This chrome extension is made to simplify usage of authentication token which can be obtained from your remote server.

The idea is that there is a remote server (or servers) that returns authentication token for provided user login and password.
And now imagine that we have different web sites where we need the token to be entered manually (or copypasted from some web site). So, instead of manual copy-pasting all the time, you can install the extenstion and use the right click context menu 'Insert Token' on editable element.

## How it works

When the user performs a right click on editable element (like textbox, textarea etc.), the extension checks current tab's URL to identify the environment from default user's settings, and when it does, the request is sent to the remote server as json:

    {
        userName: user.login,
        password: user.pass,
    }

And the server should respond with the following json:

    {
        token: "<something_here>"
    }
    
Once the token is got, the extension removes all the text from selected control and inserts the actual token.

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
  
After environments are set one can add some default users associated with the environment:

    {
        "user": "<text>", // used to differentiate users on options screen
        "env": "<name>", // one of environment names defined under 'environments' section
        "login": "<login>", // user's login name
        "pass": "<pass>", // user's password
        "isDefault": "<text>" // 'true' for default user and 'false' otherwise
    }
  
When init.json is ready do the following in Chrome:

    Chrome -> More Tools -> Extensions -> Load unpacked extension
    
Also, once the extension is installed, one could easily add users in Options screen (click on the extenstion icon -> Options)
