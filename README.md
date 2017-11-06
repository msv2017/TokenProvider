# TokenProvider

This chrome extension was made to simplify usage of authentication token which can be obtained from your remote server.

## Install

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
