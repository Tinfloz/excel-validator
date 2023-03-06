const { convertCsvToXlsx } = require('@aternus/csv-to-xlsx');
const excelToJson = require('convert-excel-to-json');
const json2xls = require("json2xls");
const fs = require("fs")

class Validator {
    constructor(type, file, headers, dataTypes) {
        this.type = type;
        this.file = file;
        this.headers = headers;
        this.result = this.type === "xls" ? this.#getFinalJsonXls() : this.#getJsonFromCSV();
        this.dataTypes = dataTypes;
        this.resultArray = this.validateJson();
        this.validatedJson = this.#getValidatedJson();
    }
    static getNextChar(a) {
        let next = String.fromCharCode(a.charCodeAt(0) + 1);
        return next
    }
    #getHeaders() {
        let columnToKey = {};
        let startChar = "A";
        let idx = 0;
        while (this.headers.length) {
            columnToKey = { ...columnToKey, [startChar]: this.headers[idx] };
            if (Object.keys(columnToKey).length === this.headers.length) {
                break
            };
            startChar = Validator.getNextChar(startChar);
            idx++;
        };
        return columnToKey
    }
    #getFinalJsonXls() {
        let key = this.#getHeaders();
        const result = {
            sourceFile: this.file,
            header: {
                rows: 1
            },
            columnToKey: key
        };
        const jsonXls = excelToJson(result).Sheet1;
        return jsonXls;
    }
    getFinalJson() {
        return this.result
    }
    #getJsonFromCSV() {
        convertCsvToXlsx(this.file, __dirname + `/uploads/${this.file.split("/").at(-1).split(".").at(0)}.xlsx`);
        const result = excelToJson({
            sourceFile: __dirname + `/uploads/${this.file.split("/").at(-1).split(".").at(0)}.xlsx`,
            header: {
                rows: 1
            },
            columnToKey: this.#getHeaders()
        });

        fs.unlink(this.file, (err) => {
            if (err && err.code == 'ENOENT') {
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                console.error("Error occurred while trying to remove file");
            } else {
                console.info(`removed`);
            }
        });
        this.file = __dirname + `/uploads/${this.file.split("/").at(-1).split(".").at(0)}.xlsx`;
        return result.Sheet1
    }

    getFieldDataType() {
        let newResult = [];
        for (let i of this.result) {
            let newJson = {};
            for (let k of Object.values(i)) {
                newJson[k] = this.dataTypes[Object.values(i).indexOf(k)];
            };
            newResult.push(newJson);
        };
        return newResult;
    }

    validateJson() {
        const validationArray = this.getFieldDataType();
        let resultArray = [];
        for (let i of validationArray) {
            const validator = Object.entries(i);
            const validatorArray = validator.map(el => {
                switch (el[1]) {
                    case "string":
                        return true
                    case "number":
                        if (/^\d+$/.test(el[0])) {
                            return true
                        };
                        return false
                    case "boolean":
                        if (/true|false/.test(el[0])) {
                            return true
                        };
                        return false
                }
            });
            let res = validatorArray.some(el => el === false);
            if (res) {
                resultArray.push(false)
            } else {
                resultArray.push(true)
            }
        };
        return resultArray
    }

    #getValidatedJson() {
        let idx = [];
        for (let i in this.resultArray) {
            if (this.resultArray[i] === false) {
                idx.push(Number(i))
            }
        };
        if (idx.length === 0) {
            return this.result
        };
        let newResult = this.result.filter(el => !idx.includes(this.result.indexOf(el)));
        return newResult
    }

    returnValidatedJson() {
        return this.validatedJson
    }
    async convertJsonToXls() {
        const name = this.file.split("/").at(-1).split(".")[0] + "new" + ".xlsx";
        let xls = json2xls(this.validatedJson);
        fs.writeFileSync(name, xls, 'binary', (err) => {
            console.log(err)
        });
        const dir = await fs.promises.opendir(__dirname + "/uploads");
        for await (let i of dir) {
            fs.unlink(__dirname + "/uploads/" + i.name, (err) => {
                if (err && err.code == 'ENOENT') {
                    console.info("File doesn't exist, won't remove it.");
                } else if (err) {
                    console.error("Error occurred while trying to remove file");
                } else {
                    console.info(`removed`);
                }
            })
        }
        return __dirname + "/" + name
    }
}

module.exports = Validator;
