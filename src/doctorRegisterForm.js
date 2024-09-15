import React, { useState } from 'react';
import doctorContract from './contracts/Doctor.json'; // Đảm bảo rằng đường dẫn này đúng
import getWeb3 from './getWeb3';
import { keccak256 } from 'web3-utils';

const DoctorRegisterForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: ''
    });

    const [message, setMessage] = useState('');

    // Hàm xử lý thay đổi dữ liệu của form
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Hàm khởi tạo contract
    const getContract = async () => {
        try {
            const web3 = await getWeb3();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = doctorContract.networks[networkId];
            const contract = new web3.eth.Contract(
                doctorContract.abi,
                deployedNetwork && deployedNetwork.address
            );
            return { web3, contract };
        } catch (error) {
            console.error('Lỗi khi khởi tạo contract:', error);
            setMessage('Lỗi khi kết nối đến hợp đồng.');
            return { web3: null, contract: null };
        }
    };

    // Hàm xử lý đăng ký bác sĩ
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { web3, contract } = await getContract();
            if (!contract || !web3) return;

            // Lấy tài khoản từ web3
            const accounts = await web3.eth.getAccounts();
            const currentAccount = accounts[0];

            // Mã hóa mật khẩu người dùng
            const hashedPassword = keccak256(formData.password);

            // Đăng ký bác sĩ
            await contract.methods.registerDoctor(
                formData.fullName,
                formData.username,
                hashedPassword
            ).send({ from: currentAccount });

            setMessage('Đăng ký bác sĩ thành công!');
        } catch (error) {
            console.error('Lỗi khi đăng ký bác sĩ:', error.message);
            setMessage('Lỗi khi đăng ký bác sĩ: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2><strong>Đăng ký bác sĩ</strong></h2>
            <input
                type="text"
                name="fullName"
                placeholder="Họ và tên"
                value={formData.fullName}
                onChange={handleChange}
                required
            />
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
            <button type="submit">Đăng ký</button>
            {message && <p>{message}</p>}
        </form>
    );
};

export default DoctorRegisterForm;
