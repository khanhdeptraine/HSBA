import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import getWeb3 from './getWeb3';
import doctorContract from './contracts/Doctor.json'; // Đảm bảo đường dẫn đúng
import patientContract from './contracts/AddPatientRecord.json'; // Import ABI hợp đồng bệnh nhân (nếu có)

const HosoPage = () => {
    const [web3, setWeb3] = useState(null);
    const [doctorContractInstance, setDoctorContractInstance] = useState(null);
    const [patientContractInstance, setPatientContractInstance] = useState(null);
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchCriteria, setSearchCriteria] = useState({}); // Lưu tiêu chí tìm kiếm
    const [searchResults, setSearchResults] = useState(null); // Lưu kết quả tìm kiếm

    const navigate = useNavigate(); // Khởi tạo navigate

    useEffect(() => {
        const init = async () => {
            try {
                // Lấy instance của web3
                const web3Instance = await getWeb3();
                setWeb3(web3Instance);

                // Lấy các tài khoản
                const accounts = await web3Instance.eth.getAccounts();
                setAccount(accounts[0]);

                // Lấy network và contract instance
                const networkId = await web3Instance.eth.net.getId();
                const deployedDoctorNetwork = doctorContract.networks[networkId];
                const deployedPatientNetwork = patientContract.networks[networkId]; // Thêm contract bệnh nhân

                if (!deployedDoctorNetwork || !deployedDoctorNetwork.address) {
                    console.error('Contract address for doctor not found.');
                    return;
                }

                if (!deployedPatientNetwork || !deployedPatientNetwork.address) {
                    console.error('Contract address for patient not found.');
                    return;
                }

                const doctorContractInstance = new web3Instance.eth.Contract(
                    doctorContract.abi,
                    deployedDoctorNetwork.address
                );
                const patientContractInstance = new web3Instance.eth.Contract(
                    patientContract.abi,
                    deployedPatientNetwork.address
                );

                setDoctorContractInstance(doctorContractInstance);
                setPatientContractInstance(patientContractInstance);
            } catch (error) {
                console.error('Error connecting to contract or blockchain:', error.message);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const handleSearchChange = (e) => {
        setSearchCriteria({
            ...searchCriteria,
            [e.target.name]: e.target.value
        });
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        try {
            // Tìm kiếm bệnh nhân bằng CCCD, mã bảo hiểm y tế hoặc họ tên và ngày sinh
            const { cccd, insuranceId, fullName, dateOfBirth } = searchCriteria;
            let result;

            if (cccd) {
                result = await patientContractInstance.methods.getPatientByCCCD(cccd).call();
            } else if (insuranceId) {
                result = await patientContractInstance.methods.getPatientByInsuranceId(insuranceId).call();
            } else if (fullName && dateOfBirth) {
                result = await patientContractInstance.methods.getPatientByNameAndDob(fullName, dateOfBirth).call();
            }

            if (result) {
                setSearchResults(result); // Lưu kết quả tìm kiếm
            } else {
                alert("Không tìm thấy hồ sơ bệnh nhân.");
            }
        } catch (error) {
            console.error("Error searching patient:", error);
            alert("Có lỗi xảy ra khi tìm kiếm hồ sơ bệnh nhân.");
        }
    };

    const viewDoctorProfile = () => {
        navigate(`/profileDoctor/${account}`); // Điều hướng đến trang ProfileDoctor
    };

    if (loading) {
        return <div>Đang tải Web3, tài khoản, và contract...</div>;
    }

    if (!web3 || !doctorContractInstance || !patientContractInstance || !account) {
        return <div>Không thể kết nối với Web3, contract, hoặc tài khoản.</div>;
    }

    return (
        <div>
            <h1>Trang Quản Lý Hồ Sơ</h1>

            <div>
                <h2>Quản lý hồ sơ bác sĩ</h2>
                <button onClick={viewDoctorProfile}>Xem hồ sơ bác sĩ</button> {/* Sử dụng button để điều hướng */}
            </div>

            <div>
                <h2>Quản lý hồ sơ bệnh án</h2>
                <Link to="/add-record">Thêm hồ sơ bệnh án</Link>
            </div>

            <div>
                <h2>Tra cứu hồ sơ bệnh nhân</h2>
                <form onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        name="cccd"
                        placeholder="Nhập CCCD"
                        value={searchCriteria.cccd || ""}
                        onChange={handleSearchChange}
                    />
                    <input
                        type="text"
                        name="insuranceId"
                        placeholder="Nhập mã bảo hiểm y tế"
                        value={searchCriteria.insuranceId || ""}
                        onChange={handleSearchChange}
                    />
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Nhập họ tên"
                        value={searchCriteria.fullName || ""}
                        onChange={handleSearchChange}
                    />
                    <input
                        type="text"
                        name="dateOfBirth"
                        placeholder="Nhập ngày sinh"
                        value={searchCriteria.dateOfBirth || ""}
                        onChange={handleSearchChange}
                    />
                    <button type="submit">Tìm kiếm</button>
                </form>
            </div>

            {searchResults && (
                <div>
                    <h2>Thông tin bệnh nhân</h2>
                    <p><strong>Họ tên:</strong> {searchResults.fullName}</p>
                    <p><strong>Ngày sinh:</strong> {searchResults.dateOfBirth}</p>
                    <p><strong>CCCD:</strong> {searchResults.cccd}</p>
                    <p><strong>Mã bảo hiểm y tế:</strong> {searchResults.insuranceId}</p>
                    {/* Hiển thị thêm thông tin nếu cần */}
                </div>
            )}
        </div>
    );
};

export default HosoPage;
