# Zaf Toolbox

## About

ZAF Toolbox, a project developed with 🩷 by **Zendesk Labs**. This toolbox is designed to accelerate the development of applications within the **Zendesk Apps Framework (ZAF)**.

> At **Zendesk Labs**, we focus on innovation and experimentation rather than production-level outputs. Our mission is to > create functional tools and solutions that enhance the ZAF application development experience. While this project is a work > in progress and may not be fully polished or bulletproof, we are committed to improving its stability every day. We welcome contributions from everyone! If you’re interested in helping us enhance this toolbox, your input and collaboration are greatly appreciated.

## Getting started

## Installation

### Requirements

- Node 18 or higher
- Add the package into a [ZAF application](https://developer.zendesk.com/documentation/apps/)

#### Sunshine Conversation Api Service configuration

To build the `authorizationToken`, you can use the following command:

```bash
echo -n "<your-api-key-id>:<your-api-secret-key>" | base64
```

A tool has been developed to help you generate this token, follow this [link](https://zendesklabs.zendesk.com/hc/en-us/p/sunco-token-generator)

### Install the package

This package is deployed using GitHub Packages, to install it you will need to follow
this [guide](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages).

Here is a TL;DR; version of the installation guide:

1. Create a personal GitHub access token (classic) with the `read:packages` permission
2. Using GitHub interface, allow the token to be used on Zendesk organizations (_Configure SSO_ button)
3. On your terminal, execute:
    ```shell
    npm login --registry=https://npm.pkg.github.com
    ```
    The username to use is your GitHub username, the password is the token created at step 1
4. If you need to install any `@zendesk` npm packages (i.e. `@zendesk/zcli`), do it now
5. Create a `.npmrc` file at the root of your repository and copy the following on it: `@zendesk:registry=https://npm.pkg.github.com`
6. Execute the following command:
    ```shell
    npm i @zendesk/zaf-toolbox
    ```

For more information on package installing through GitHub packages,
see "[Installing a package](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package)".

### Development setup

Use the package locally, first build the package by executing:

```shell
npm run build
```

On the `package.json` of your project, add the following:

```json
{
    "dependencies": {
        "@zendesk/zaf-toolbox": "file:<path-to-repository>"
    }
}
```

Enjoy!

## Copyright and license

Copyright 2024 Zendesk, Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
