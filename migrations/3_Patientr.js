const AddPatientRecord = artifacts.require("AddPatientRecord");

module.exports = function (deployer) {
    // Triển khai hợp đồng PatientRecord
    deployer.deploy(AddPatientRecord);
};
