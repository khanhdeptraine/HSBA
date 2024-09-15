// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Doctor {
    struct DoctorProfile {
        string fullName;
        string username;
        bytes32 passwordHash; // Sử dụng bytes32 để lưu mật khẩu đã mã hóa
        string dateOfBirth;
        string contactAddress;
        string phoneNumber;
        string email;
        string specialization;
        string qualifications;
        string workExperience;
        string profilePictureCID; // Lưu CID của ảnh đại diện
        string introduction;
    }

    mapping(string => DoctorProfile) private doctors;
    mapping(string => bool) private usernameExists;

    event DoctorRegistered(string username, string fullName);
    event DoctorUpdated(string username, string fullName);
    event DoctorProfileUpdated(
        string username,
        string fullName,
        string dateOfBirth,
        string contactAddress,
        string phoneNumber,
        string email,
        string specialization,
        string qualifications,
        string workExperience,
        string profilePictureCID,
        string introduction
    );

    // Hàm hỗ trợ mã hóa mật khẩu
    function hashPassword(
        string memory _password
    ) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(_password));
    }

    // Đăng ký bác sĩ mới với mật khẩu đã mã hóa
    function registerDoctor(
        string memory _fullName,
        string memory _username,
        string memory _password
    ) public {
        require(!usernameExists[_username], "Username is already taken");

        doctors[_username] = DoctorProfile({
            fullName: _fullName,
            username: _username,
            passwordHash: hashPassword(_password), // Lưu mật khẩu đã mã hóa
            dateOfBirth: "",
            contactAddress: "",
            phoneNumber: "",
            email: "",
            specialization: "",
            qualifications: "",
            workExperience: "",
            profilePictureCID: "",
            introduction: ""
        });

        usernameExists[_username] = true;

        emit DoctorRegistered(_username, _fullName);
    }

    // Cập nhật thông tin bác sĩ và mật khẩu mã hóa
    // Cập nhật thông tin bác sĩ và mật khẩu mã hóa (nếu mật khẩu thay đổi)
    function updateDoctor(
        string memory _fullName,
        string memory _username,
        string memory _password, // Mật khẩu có thể thay đổi hoặc giữ nguyên
        string memory _dateOfBirth,
        string memory _contactAddress,
        string memory _phoneNumber,
        string memory _email,
        string memory _specialization,
        string memory _qualifications,
        string memory _workExperience,
        string memory _profilePictureCID,
        string memory _introduction
    ) public {
        require(usernameExists[_username], "Doctor does not exist");

        // Lấy thông tin bác sĩ hiện tại
        DoctorProfile storage doctor = doctors[_username];

        // Cập nhật thông tin khác
        doctor.fullName = _fullName;
        doctor.dateOfBirth = _dateOfBirth;
        doctor.contactAddress = _contactAddress;
        doctor.phoneNumber = _phoneNumber;
        doctor.email = _email;
        doctor.specialization = _specialization;
        doctor.qualifications = _qualifications;
        doctor.workExperience = _workExperience;
        doctor.profilePictureCID = _profilePictureCID;
        doctor.introduction = _introduction;

        // Kiểm tra nếu mật khẩu được thay đổi
        if (keccak256(abi.encodePacked(_password)) != doctor.passwordHash) {
            doctor.passwordHash = hashPassword(_password); // Cập nhật mật khẩu mới nếu có thay đổi
        }

        // Phát sự kiện cập nhật hồ sơ
        emit DoctorUpdated(_username, _fullName);
        emit DoctorProfileUpdated(
            _username,
            _fullName,
            _dateOfBirth,
            _contactAddress,
            _phoneNumber,
            _email,
            _specialization,
            _qualifications,
            _workExperience,
            _profilePictureCID,
            _introduction
        );
    }

    // Hàm kiểm tra mật khẩu
    // Hàm kiểm tra mật khẩu
    function verifyPassword(
        string memory _username,
        string memory _password
    ) public view returns (bool) {
        require(usernameExists[_username], "Doctor does not exist");

        DoctorProfile memory doctor = doctors[_username];

        // So sánh mật khẩu đã băm
        return doctor.passwordHash == hashPassword(_password);
    }

    // Kiểm tra tên người dùng đã được sử dụng chưa
    function isUserTaken(string memory _username) public view returns (bool) {
        return usernameExists[_username];
    }

    // Hàm để lấy thông tin bác sĩ
    function getDoctorInfo(
        string memory _username
    )
        public
        view
        returns (
            string memory fullName,
            string memory username,
            bytes32 passwordHash,
            string memory dateOfBirth,
            string memory contactAddress,
            string memory phoneNumber,
            string memory email,
            string memory specialization,
            string memory qualifications,
            string memory workExperience,
            string memory profilePictureCID,
            string memory introduction
        )
    {
        require(usernameExists[_username], "Doctor does not exist");

        DoctorProfile memory doctor = doctors[_username];
        return (
            doctor.fullName,
            doctor.username,
            doctor.passwordHash,
            doctor.dateOfBirth,
            doctor.contactAddress,
            doctor.phoneNumber,
            doctor.email,
            doctor.specialization,
            doctor.qualifications,
            doctor.workExperience,
            doctor.profilePictureCID,
            doctor.introduction
        );
    }
}
