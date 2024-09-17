import React, { useState } from 'react';
import doctorContract from './contracts/Doctor.json'; // Đảm bảo rằng đường dẫn này đúng
import patientRecordContract from './contracts/AddPatientRecord.json'; // Đảm bảo đường dẫn đúng
import getWeb3 from './getWeb3';
import { keccak256 } from 'web3-utils';
import { useNavigate } from 'react-router-dom';

const DoctorLoginForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        searchUsername: '',
        searchCCCD: '',
        searchInsuranceNumber: ''
    });

    const [message, setMessage] = useState('');
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(false); // Mặc định là ẩn form đăng nhập
    const navigate = useNavigate(); // Khởi tạo useNavigate

    // Hàm xử lý thay đổi dữ liệu của form
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Hàm khởi tạo contract
    const getContract = async (contractJson) => {
        try {
            const web3 = await getWeb3();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = contractJson.networks[networkId];
            const contract = new web3.eth.Contract(
                contractJson.abi,
                deployedNetwork && deployedNetwork.address
            );
            return { web3, contract };
        } catch (error) {
            console.error('Lỗi khi khởi tạo contract:', error);
            setMessage('Lỗi khi kết nối đến hợp đồng.');
            return { web3: null, contract: null };
        }
    };

    // Hàm kiểm tra tên người dùng đã được sử dụng chưa
    const checkUsernameAvailability = async (username) => {
        try {
            const { contract } = await getContract(doctorContract);
            if (!contract) return false;
            const isTaken = await contract.methods.isUserTaken(username).call();
            return isTaken;
        } catch (error) {
            console.error('Lỗi khi kiểm tra tên người dùng:', error);
            return false;
        }
    };

    // Hàm kiểm tra mật khẩu
    const verifyPassword = async (username, password) => {
        try {
            const { contract } = await getContract(doctorContract);
            if (!contract) return false;

            // Mã hóa mật khẩu người dùng
            const hashedPassword = keccak256(password);

            // Kiểm tra mật khẩu
            const isPasswordCorrect = await contract.methods.verifyPassword(username, hashedPassword).call();
            return isPasswordCorrect;
        } catch (error) {
            console.error('Lỗi khi kiểm tra mật khẩu:', error);
            return false;
        }
    };

    // Hàm tra cứu thông tin bệnh án dựa trên CCCD hoặc số bảo hiểm y tế
    const fetchPatientRecord = async (identifier, isCCCD) => {
        try {
            const { contract } = await getContract(patientRecordContract);
            if (!contract) return;

            // Tra cứu bệnh án bằng CCCD hoặc số bảo hiểm y tế
            const address = isCCCD
                ? await contract.methods.cccdToAddress(identifier).call()
                : await contract.methods.insuranceToAddress(identifier).call();

            // Chuyển hướng đến trang profilePatient với địa chỉ bệnh án
            if (address) {
                navigate(`/profilePatient/${address}`);
            } else {
                setMessage('Không tìm thấy hồ sơ.');
            }
        } catch (error) {
            console.error('Lỗi khi tra cứu hồ sơ:', error);
            setMessage('Lỗi khi tra cứu hồ sơ.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // Kiểm tra tính khả dụng của tên người dùng
            const usernameAvailable = await checkUsernameAvailability(formData.username);
            if (!usernameAvailable) {
                setMessage('Tên người dùng không tồn tại.');
                return;
            }

            // Kiểm tra mật khẩu
            const isPasswordCorrect = await verifyPassword(formData.username, formData.password);
            if (isPasswordCorrect) {
                setMessage('Đăng nhập thành công!');
                // Chuyển hướng đến trang ProfileDoctor với tên người dùng
                navigate(`/profiledoctor/${formData.username}`);
            } else {
                setMessage('Mật khẩu không đúng.');
            }
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error.message);
            setMessage('Lỗi khi đăng nhập: ' + error.message);
        }
    };

    const handleSearch = async () => {
        try {
            if (formData.searchCCCD) {
                await fetchPatientRecord(formData.searchCCCD, true);
            } else if (formData.searchInsuranceNumber) {
                await fetchPatientRecord(formData.searchInsuranceNumber, false);
            } else {
                setMessage('Vui lòng nhập CCCD hoặc số bảo hiểm y tế để tra cứu.');
            }
        } catch (error) {
            console.error('Lỗi khi tra cứu thông tin bệnh án:', error.message);
            setMessage('Lỗi khi tra cứu: ' + error.message);
        }
    };

    return (
        <div>
            {!isLoginFormVisible && (
                <div>
                    <button onClick={() => setIsLoginFormVisible(true)}>Hiện form đăng nhập</button>
                </div>
            )}

            {isLoginFormVisible && (
                <form onSubmit={handleLogin}>
                    <h2><strong>Đăng nhập bác sĩ</strong></h2>
                    <input
                        type="text"
                        name="username"
                        placeholder="Tên người dùng"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Đăng nhập</button>
                    <button type="button" onClick={() => setIsLoginFormVisible(false)}>Ẩn form</button>
                </form>
            )}

            <div>
                <h3>Tra cứu hồ sơ bệnh án</h3>
                <input
                    type="text"
                    name="searchCCCD"
                    placeholder="Nhập CCCD"
                    value={formData.searchCCCD}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="searchInsuranceNumber"
                    placeholder="Nhập số bảo hiểm y tế"
                    value={formData.searchInsuranceNumber}
                    onChange={handleChange}
                />
                <button type="button" onClick={handleSearch}>Tra cứu</button>
            </div>

            {message && <p>{message}</p>}
        </div>
    );
};

export default DoctorLoginForm;
