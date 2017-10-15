import { SSM } from 'aws-sdk';
export interface IOptions {
    ssm: SSM;
    strict: boolean;
}
export declare function loadConfig(configFilePath: string, options: IOptions): Promise<any>;
export declare function loadSsmParamsIntoConfig(config: any, options: IOptions): Promise<any>;
export interface IParamMap {
    key: string;
    to: string;
}
export declare function loadMappedSsmParamsIntoConfig(config: any, paramMap: IParamMap[], options: IOptions): Promise<any>;
