import React, { useState } from 'react';
import doctorContract from './contracts/Doctor.json'; // Đảm bảo rằng đường dẫn này đúng
import getWeb3 from './getWeb3';
import { keccak256 } from 'web3-utils';
import { useNavigate } from 'react-router-dom';

const DoctorLoginForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Khởi tạo useNavigate

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

    // Hàm kiểm tra tên người dùng đã được sử dụng chưa
    const checkUsernameAvailability = async (username) => {
        try {
            const { contract } = await getContract();
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
            const { contract } = await getContract();
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

    // Hàm xử lý đăng nhập
    const handleSubmit = async (e) => {
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

    return (
        <form onSubmit={handleSubmit}>
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
            {message && <p>{message}</p>}
        </form>
    );
};

export default DoctorLoginForm;
