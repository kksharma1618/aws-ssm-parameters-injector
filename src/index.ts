import * as objectPath from 'object-path'
// load config from provided file path (require(path) should return json)
// parses it for ssm keys and loads and injects those keys from ssm parameters
export interface IOptions {
    ssm,
    strict?: boolean // in strict mode any missing ssm param will throw error
}
export async function loadConfig<T>(configFilePath: string, options: IOptions) {
    const config: T = require(configFilePath)
    return loadSsmParamsIntoConfig<T>(Object.assign({}, config), options)
}
export async function loadSsmParamsIntoConfig<T>(config: T, options: IOptions) {
    const mapper = parseObjectForSsmFields(config)
    return loadMappedSsmParamsIntoConfig<T>(config, mapper, options)
}
export interface IParamMap {
    key: string,
    to: string
}
export async function loadMappedSsmParamsIntoConfig<T>(config: T, paramMap: IParamMap[], options: IOptions) {
    const ssm = options.ssm
    const names = paramMap.map((m) => m.key)
    const data = await getSsmParamters(ssm, names)

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
        if (typeof values[m.key] === 'string') {
            try {
                values[m.key] = JSON.parse(values[m.key])
            } catch (e) { }
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
                    to: path ? `${path}.${key}` : key
                })
            }
        }
    })
    return parsed
}
export interface ISSMResponse {
    Parameters: Array<{
        Name: string,
        Type: 'String' | 'StringList' | 'SecureString',
        Value: string
    }>,
    InvalidParameters: string[]
}
async function getSsmParamters(ssm, names: string[], batchSize = 10, parallel = 5) {
    const batches = splitIntoChunks(names, batchSize)
    const parallelBatches = splitIntoChunks(batches, parallel)
    const data: ISSMResponse = {
        Parameters: [],
        InvalidParameters: []
    }
    for (const parallelBatch of parallelBatches) {
        const results: ISSMResponse[] = await Promise.all(parallelBatch.map((batch) => {
            return ssm.getParameters({
                Names: names,
                WithDecryption: true
            }).promise()
        }))
        results.forEach((result) => {
            if (!result || !Array.isArray(result.Parameters)) {
                throw new Error('cant_load_ssm_params')
            }
            data.Parameters = data.Parameters.concat(result.Parameters)
            data.InvalidParameters = data.InvalidParameters.concat(result.InvalidParameters || [])
        })
    }
    return data
}
function splitIntoChunks<T>(array: T[], len) {
    if (len < 1) {
        len = 1
    }
    const chunks: T[][] = []
    let i = 0
    while (i < array.length) {
        chunks.push(array.slice(i, i += len));
    }
    return chunks
}
