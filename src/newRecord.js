// newRecord.js

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import getWeb3 from "./getWeb3";
import patientRecordContract from "./contracts/AddPatientRecord.json"; // ABI của hợp đồng AddPatientRecord

function NewRecord() {
    const location = useLocation();
    const navigate = useNavigate();
    const { record, imageUrls } = location.state || {};
    const [formData, setFormData] = useState(record || {});
    const [isEditing, setIsEditing] = useState(false);
    const [contract, setContract] = useState(null);
    const [accounts, setAccounts] = useState(null);

    // Initialize Web3 and contract
    const init = async () => {
        try {
            const web3 = await getWeb3();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = patientRecordContract.networks[networkId];

            if (!deployedNetwork || !deployedNetwork.address) {
                throw new Error("Hợp đồng không được triển khai trên mạng này.");
            }

            const contractInstance = new web3.eth.Contract(
                patientRecordContract.abi,
                deployedNetwork.address
            );

            setContract(contractInstance);
            const accounts = await web3.eth.getAccounts();
            setAccounts(accounts);
        } catch (error) {
            console.error("Lỗi khi kết nối với blockchain:", error);
        }
    };

    // Call init on component mount
    useEffect(() => {
        init();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateRecord = async (e) => {
        e.preventDefault();

        try {
            await contract.methods
                .addRecord(
                    formData.fullName,
                    formData.dateOfBirth,
                    formData.hometown,
                    formData.occupation,
                    formData.cccd,
                    formData.healthInsuranceNumber,
                    formData.admissionDateTime,
                    formData.mriOrXrayCIDs || [],
                    formData.diagnosis,
                    formData.medicalHistory,
                    formData.conclusion
                )
                .send({ from: accounts[0], gas: 3000000 });

            alert("Cập nhật hồ sơ bệnh án thành công!");

            // Chuyển hướng đến trang hồ sơ bệnh án sau khi cập nhật
            navigate('/newRecord', { state: { record: formData, imageUrls } });
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ:", error);
            alert("Không thể cập nhật hồ sơ bệnh án.");
        }
    };

    return (
        <div>
            <h1>Thông Tin Hồ Sơ Bệnh Án</h1>
            <div>
                <h2>Chi Tiết Hồ Sơ</h2>
                <p><strong>Họ tên:</strong> {formData.fullName}</p>
                <p><strong>Ngày sinh:</strong> {formData.dateOfBirth}</p>
                <p><strong>Quê quán:</strong> {formData.hometown}</p>
                <p><strong>Nghề nghiệp:</strong> {formData.occupation}</p>
                <p><strong>Số CCCD:</strong> {formData.cccd}</p>
                <p><strong>Số bảo hiểm y tế:</strong> {formData.healthInsuranceNumber}</p>
                <p><strong>Ngày giờ vào viện:</strong> {formData.admissionDateTime}</p>
                <p><strong>Chẩn đoán:</strong> {formData.diagnosis}</p>
                <p><strong>Lịch sử y tế:</strong> {formData.medicalHistory}</p>
                <p><strong>Kết luận:</strong> {formData.conclusion}</p>
                {imageUrls && imageUrls.length > 0 && (
                    <div>
                        <h3>Ảnh bệnh án</h3>
                        {imageUrls.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Ảnh bệnh án ${index + 1}`}
                                style={{ width: '90%', marginBottom: '10px', border: '1px solid #ddd' }} // Thêm viền cho ảnh
                            />
                        ))}
                    </div>
                )}
                <button onClick={() => setIsEditing(true)}>Chỉnh sửa hồ sơ</button>
            </div>

            {isEditing && (
                <div>
                    <h2>Cập Nhật Hồ Sơ Bệnh Án</h2>
                    <form onSubmit={handleUpdateRecord}>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName || ''}
                            onChange={handleChange}
                            placeholder="Họ tên"
                        />
                        <input
                            type="text"
                            name="dateOfBirth"
                            value={formData.dateOfBirth || ''}
                            onChange={handleChange}
                            placeholder="Ngày tháng năm sinh"
                        />
                        <input
                            type="text"
                            name="hometown"
                            value={formData.hometown || ''}
                            onChange={handleChange}
                            placeholder="Quê quán"
                        />
                        <input
                            type="text"
                            name="occupation"
                            value={formData.occupation || ''}
                            onChange={handleChange}
                            placeholder="Nghề nghiệp"
                        />
                        <input
                            type="text"
                            name="cccd"
                            value={formData.cccd || ''}
                            onChange={handleChange}
                            placeholder="Số CCCD"
                        />
                        <input
                            type="text"
                            name="healthInsuranceNumber"
                            value={formData.healthInsuranceNumber || ''}
                            onChange={handleChange}
                            placeholder="Số bảo hiểm y tế"
                        />
                        <input
                            type="text"
                            name="admissionDateTime"
                            value={formData.admissionDateTime || ''}
                            onChange={handleChange}
                            placeholder="Ngày giờ vào viện"
                        />
                        <input
                            type="text"
                            name="diagnosis"
                            value={formData.diagnosis || ''}
                            onChange={handleChange}
                            placeholder="Chẩn đoán"
                        />
                        <textarea
                            name="medicalHistory"
                            value={formData.medicalHistory || ''}
                            onChange={handleChange}
                            placeholder="Lịch sử y tế"
                        />
                        <textarea
                            name="conclusion"
                            value={formData.conclusion || ''}
                            onChange={handleChange}
                            placeholder="Kết luận"
                        />
                        <button type="submit">Cập nhật hồ sơ</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default NewRecord;
