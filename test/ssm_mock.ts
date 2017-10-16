const ssmValues = require('./ssm_param_values.json')
export default {
    getParameters: (options) => {
        return {
            promise: async () => {
                return new Promise((resolve, reject) => {
                    const missingKeys: string[] = []
                    const data: any = {
                        Parameters: []
                    }
                    options.Names.forEach((key: string) => {
                        if (ssmValues[`ssm:${key}`] === undefined) {
                            missingKeys.push(key)
                        } else {
                            data.Parameters.push({
                                Name: key,
                                Value: ssmValues[`ssm:${key}`]
                            })
                        }
                    })
                    data.InvalidParameters = missingKeys
                    process.nextTick(() => {
                        resolve(data)
                    })
                })
            }
        }
    }
}
