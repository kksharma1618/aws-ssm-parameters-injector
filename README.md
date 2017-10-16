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

## Example
Assuming you have 3 values in your ssm paramters.

```
/app/token = 'sometoken'
/app/some/url = 'https://someurl.com'
/app/some/json = '{"a": 23}'
```

And, your config object is
```
{
    "myAppUrl": "ssm:/app/some/url",
    "b": {
        "myToken": "ssm:/app/token",
        "someObject": "ssm:/app/some/json"
    },
    "c": "normalData"
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
            "someObject": {"a": 23}
        },
        "c": "normalData"
    }
    */
}, (e) => {
    // err if any
})
```
