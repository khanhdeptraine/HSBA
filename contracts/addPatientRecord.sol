// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AddPatientRecord {
    struct Record {
        string fullName;
        string dateOfBirth;
        string hometown;
        string occupation;
        string cccd;
        string healthInsuranceNumber;
        string admissionDateTime;
        string[] mriOrXrayCIDs; // Sử dụng mảng string
        string diagnosis;
        string medicalHistory;
        string conclusion;
    }

    // Địa chỉ của người thêm hồ sơ => Hồ sơ bệnh án
    mapping(address => Record) public records;

    // Số lượng hồ sơ đã thêm
    uint256 public recordCount = 0;

    // Sự kiện khi thêm hồ sơ mới
    event RecordAdded(uint256 indexed recordId, string fullName);

    function addRecord(
        string memory _fullName,
        string memory _dateOfBirth,
        string memory _hometown,
        string memory _occupation,
        string memory _cccd,
        string memory _healthInsuranceNumber,
        string memory _admissionDateTime,
        string[] memory _mriOrXrayCIDs, // Thay đổi tham số thành mảng
        string memory _diagnosis,
        string memory _medicalHistory,
        string memory _conclusion
    ) public {
        records[msg.sender] = Record({
            fullName: _fullName,
            dateOfBirth: _dateOfBirth,
            hometown: _hometown,
            occupation: _occupation,
            cccd: _cccd,
            healthInsuranceNumber: _healthInsuranceNumber,
            admissionDateTime: _admissionDateTime,
            mriOrXrayCIDs: _mriOrXrayCIDs,
            diagnosis: _diagnosis,
            medicalHistory: _medicalHistory,
            conclusion: _conclusion
        });

        emit RecordAdded(recordCount, _fullName);
        recordCount++;
    }

    // Lấy thông tin hồ sơ bệnh án theo địa chỉ
    function getRecord(
        address _recordOwner
    )
        public
        view
        returns (
            string memory fullName,
            string memory dateOfBirth,
            string memory hometown,
            string memory occupation,
            string memory cccd, // Trả về số CCCD
            string memory healthInsuranceNumber, // Trả về số bảo hiểm y tế
            string memory admissionDateTime, // Trả về ngày giờ vào viện
            string[] memory mriOrXrayCIDs, // Trả về danh sách CID
            string memory diagnosis,
            string memory medicalHistory,
            string memory conclusion // Trả về kết luận
        )
    {
        Record memory record = records[_recordOwner];
        return (
            record.fullName,
            record.dateOfBirth,
            record.hometown,
            record.occupation,
            record.cccd, // Trả về số CCCD
            record.healthInsuranceNumber, // Trả về số bảo hiểm y tế
            record.admissionDateTime, // Trả về ngày giờ vào viện
            record.mriOrXrayCIDs, // Trả về danh sách CID
            record.diagnosis,
            record.medicalHistory,
            record.conclusion // Trả về kết luận
        );
    }

    // Lấy số lượng hồ sơ bệnh án
    function getRecordCount() public view returns (uint256) {
        return recordCount;
    }
}
