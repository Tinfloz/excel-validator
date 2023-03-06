const Validator = require("../main");

exports.getFile = async (req, res) => {
    try {
        const file = req.file;
        const { headers, dataTypes } = req.body;
        console.log(headers, "headrs")
        const fileInstance = new Validator("xls", file.path, headers, dataTypes);
        res.download(await fileInstance.convertJsonToXls());
    } catch (error) {
        console.log(error);
    };
};