# OAuth Server for test

## Install

- Install node.js from <https://nodejs.org/>

  You should be able to run `node` and `npm` after it's properly installed.
  
  ```
  $ node -v
  v0.12.2
  $ npm -v
  2.7.4
  ```

- Setup proxy if it's required to access internet. Following <http://jjasonclark.com/how-to-setup-node-behind-web-proxy/>.

- Install `babel` module globally

  ```
  $ npm install -g babel
  ```
  
- Extract the tarball

- Install dependency modules

  ```
  $ cd oauthserver
  $ npm install
  ```
  
- Configure the OAuth Server

  The default configuration file is `oauthserver/config/default.json`. If you need to modify any configure item, create a new file `oauthserver/config/local.json` and put only the items that need to be changed into it. The local config will overrides the default config.
  
## Start

Start the server:

```
$ cd oauthserver
$ npm start
```

Can also start the server with [nodemon](http://nodemon.io/) if it's installed:

```
$ cd oauthserver
$ nodemon index.es
```

# Functions and Interfaces

This node.js module is for test purpose only. It includes an OAuth 2.0 Server with crude and simple user portal, a demo app which acts as OAuth client and a demo resource server which provides a do-nothing API.

Authorization code is the only supported grant type. Scope and refresh token is not supported.

Authorization codes and acess tokens are not persistented. Will lost after server stop.

```
                +---------------+                                
                |               |                                
       +--------+  User Agent   +-------+                        
       |        |               |       |  user login &          
       |        +---------------+       |  authorization endpoint
       v                                v                        
+--------------+  token       +-------------------+              
|              |  endpoint    |                   |              
|   Demo App   +------------> |    OAuth Server   |              
|              |              |    with portal    |              
|              |              |                   |              
+------+-------+              +---------+---------+              
       |                                ^                        
       |                                | introspect endpoint    
       |                                |                        
       |                      +---------+---------+              
       |     API (w/ token)   |                   |              
       +--------------------> |  Resource Server  |              
                              |                   |              
                              +-------------------+              
```

OAuth Server API:

- POST /oauth2/token
- POST /oauth2/introspect

User Portal:

- /portal/           (Web)
- GET /portal/authorize  (API)

Demo App (Web):

- /app/

Resource Server API:

- GET /api/user


# Reference

[RFC 6749](https://tools.ietf.org/html/rfc6749) OAuth 2.0 Authorization Framework

[draft-ietf-oauth-introspection](https://tools.ietf.org/html/draft-ietf-oauth-introspection-11) OAuth 2.0 Token Introspection
