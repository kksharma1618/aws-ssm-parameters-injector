# aws-ssm-parameters-injector

[![Build Status](https://travis-ci.org/kksharma1618/aws-ssm-parameters-injector.svg?branch=master)](https://travis-ci.org/kksharma1618/aws-ssm-parameters-injector)

A utility module to load and inject ssm parameters into json configuration objects

## Installation
```
npm install --save aws-ssm-parameters-injector
```

## Usage
``` javascript
const injector = require('aws-ssm-parameters-injector')

injector.loadConfig(configFilePath, options).then((r) => {
    // config loaded and injected with ssm parameters
}, (e) => {
    // err if any
})
// or
injector.loadSsmParamsIntoConfig(configObject, options).then((r) => {
    // config injected with ssm parameters
}, (e) => {
    // err if any
})
```

## Options
``` javascript
{
    ssm: SSM, // Create and provide object of SSM // new require('aws-sdk').SSM()
    strict?: boolean // in strict mode any missing ssm param will throw error
}
```

## Config
Any json object. If you want to load a string from ssm then use 'ssm:/path/to/ssm/param' as its value

### String template
"prefix{ssm:/path/to/ssm/param}suffix" - see "d" in the example below

### Object template
"prefix{ssm:/path/to/ssm/param paramObjectPath}suffix" - see "e" in the example below

## Example
Assuming you have 5 values in your ssm paramters.

```
/app/token = 'sometoken'
/app/some/url = 'https://someurl.com'
/app/some/json = '{"d":{"v":2}}'
```

And, your config object is
```
{
    "myAppUrl": "ssm:/app/some/url",
    "b": {
        "myToken": "ssm:/app/token",
        "someObject": "ssm:/app/some/json"
    },
    "c": "normalData",
    "d": "pr{ssm:/app/token}su",
    "e": "pr{ssm:/app/some/json d.v}su"
}
```

Then,
``` javascript
const injector = require('aws-ssm-parameters-injector')

injector.loadSsmParamsIntoConfig(configObject, options).then((r) => {
    /*
    config:
    {
        "myAppUrl": "https://someurl.com",
        "b": {
            "myToken": "sometoken",
            "someObject": {"d": {"v": 2}}
        },
        "c": "normalData",
        "d": "prsometokensu",
        "e": "pr2su"
    }
    */
}, (e) => {
    // err if any
})
```
