import * as objectPath from 'object-path'
import {SSM} from 'aws-sdk'
// load config from provided file path (require(path) should return json)
// parses it for ssm keys and loads and injects those keys from ssm parameters
export interface IOptions {
    ssm: SSM, // doesnt load ssm module, just using the type
    strict: boolean // in strict mode any missing ssm param will throw error
}
export async function loadConfig(configFilePath: string, options: IOptions) {
    return loadSsmParamsIntoConfig(require(configFilePath), options)
}
export async function loadSsmParamsIntoConfig(config, options: IOptions) {
    const mapper = parseObjectForSsmFields(config)
    return loadMappedSsmParamsIntoConfig(config, mapper, options)
}
export interface IParamMap {
    key: string,
    to: string
}
export async function loadMappedSsmParamsIntoConfig(config, paramMap: IParamMap[], options: IOptions) {
    const ssm = options.ssm
    const names = paramMap.map((m) => m.key)
    const data = await ssm.getParameters({
        Names: names,
        WithDecryption: true
    }).promise()

    if (!data || !Array.isArray(data.Parameters)) {
        throw new Error('cant_load_ssm_params')
    }
    const values = {}
    data.Parameters.forEach((p) => {
        if (!p.Name) {
            return
        }
        values[p.Name] = p.Value
    })
    paramMap.forEach((m) => {
        if (values[m.key] === undefined) {
            if (options.strict) {
                const e = new Error('missing_ssm_param');
                (e as any).param = m.key
                throw e
            }
            return
        }
        objectPath.set(config, m.to, values[m.key])
    })
    return config
}
function parseObjectForSsmFields(obj, path = '') {
    let parsed: IParamMap[] = []
    if (obj !== Object(obj)) {
        return parsed
    }
    Object.keys(obj).forEach((key) => {
        if (obj[key] === Object(obj[key])) {
            // recurse on object values
            parsed = parsed.concat(parseObjectForSsmFields(obj[key], path ? `${path}.${key}` : key))
        } else if (typeof obj[key] === 'string') {
            // only string values can have ssm field
            if (obj[key].indexOf('ssm:') === 0) {
                parsed.push({
                    key: obj[key].substr(4),
                    to: `${path}.${key}`
                })
            }
        }
    })
    return parsed
}