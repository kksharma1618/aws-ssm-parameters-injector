// tslint:disable:no-console
import ssm from '../test/ssm_mock'
import * as model from './index'
import * as chai from 'chai'
import * as path from 'path'
const expect = chai.expect
const configToTest = JSON.parse(JSON.stringify(require('../test/config_to_test.json')))
const configFilePath = path.resolve(__dirname, '../test/config_to_test.json')

describe('model', () => {
    let config
    beforeEach(() => {
        config = JSON.parse(JSON.stringify(configToTest))
    })
    function testConfig(c) {
        expect(c).to.be.an('object')
        expect(c).to.have.property('b', 'bv')
        expect(c).to.have.property('c').which.is.an('object')
        // auto parse json
        expect(c.c).to.have.property('c1').which.is.an('object')
        expect(c.c.c1).to.have.property('c1v', 23)
        expect(c.c).to.have.property('c2').which.is.an('object')
        expect(c.c.c2).to.have.property('c21', 'c21v')
        expect(c.c.c2).to.have.property('c22', 2)
    }
    describe('model.loadConfig', () => {
        it('should work', async () => {
            const c = await model.loadConfig(configFilePath, {
                ssm
            } as any)
            testConfig(c)
        })
    })
    describe('model.loadSsmParamsIntoConfig', () => {
        it('should work', async () => {
            const c = await model.loadSsmParamsIntoConfig(config, {
                ssm
            } as any)
            testConfig(c)
        })
    })
    describe('model.loadMappedSsmParamsIntoConfig', () => {
        it('should work', async () => {
            const mapper = [{ key: '/path/b', to: 'b' },
            { key: '/path/c21', to: 'c.c2.c21' } ]
            const c = await model.loadMappedSsmParamsIntoConfig(config, mapper, {
                ssm
            } as any)
            expect(c).to.be.an('object')
            expect(c).to.have.property('b', 'bv')
            expect(c).to.have.property('c').which.is.an('object')
            // this wasnt mapped
            expect(c.c).to.have.property('c1', 'ssm:/path/c1')
            expect(c.c).to.have.property('c2').which.is.an('object')
            expect(c.c.c2).to.have.property('c21', 'c21v')
            expect(c.c.c2).to.have.property('c22', 2)
        })
    })
})