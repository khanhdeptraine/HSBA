import React, { useState, useEffect } from "react";
import getWeb3 from "./getWeb3";
import { useParams, useNavigate } from "react-router-dom";
import doctorContract from "./contracts/Doctor.json"; // ABI của hợp đồng Doctor
import axios from "axios";
import { keccak256 } from 'web3-utils'; // Import keccak256

function UpdateDoctor() {
    const { username } = useParams(); // Lấy username từ URL
    const [contract, setContract] = useState(null);
    const [profile, setProfile] = useState(null);
    const [editableProfile, setEditableProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [accounts, setAccounts] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            try {
                const web3 = await getWeb3();
                const networkId = await web3.eth.net.getId();
                const deployedNetwork = doctorContract.networks[networkId];
                const contractInstance = new web3.eth.Contract(
                    doctorContract.abi,
                    deployedNetwork && deployedNetwork.address
                );

                setContract(contractInstance);
                const accounts = await web3.eth.getAccounts();
                setAccounts(accounts);

                if (username) {
                    const result = await contractInstance.methods.getDoctorInfo(username).call();
                    const profileData = {
                        fullName: result[0],
                        username: result[1],
                        passwordHash: result[2],
                        dateOfBirth: result[3],
                        contactAddress: result[4],
                        phoneNumber: result[5],
                        email: result[6],
                        specialization: result[7],
                        qualifications: result[8],
                        workExperience: result[9],
                        profilePictureCID: result[10],
                        introduction: result[11]
                    };
                    setProfile(profileData);
                    setEditableProfile(profileData);
                }
            } catch (error) {
                console.error("Lỗi khi kết nối với blockchain:", error);
            }
        };

        init();
    }, [username]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUploadToPinata = async () => {
        if (!file) {
            alert("Vui lòng chọn một tệp ảnh.");
            return;
        }

        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
        let data = new FormData();
        data.append("file", file);

        const pinataApiKey = "1d570e375d82ae085962";
        const pinataSecretApiKey = "d3fb38e777a9d31064b463aa79d55d45ea95c037e4571b3c514c9f1983f39a47";

        try {
            const res = await axios.post(url, data, {
                headers: {
                    "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey,
                },
            });

            const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
            setImageUrl(ipfsUrl);
            setEditableProfile((prevState) => ({
                ...prevState,
                profilePictureCID: res.data.IpfsHash
            }));
            alert("Tải ảnh lên thành công!");
        } catch (error) {
            console.error("Lỗi khi tải ảnh lên:", error);
            alert("Không thể tải ảnh lên.");
        }
    };

    const handleChange = (e) => {
        setEditableProfile({
            ...editableProfile,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (!editableProfile.username) {
            alert("Tên người dùng là bắt buộc.");
            return;
        }

        try {
            // Mã hóa mật khẩu người dùng
            const hashedPassword = keccak256(editableProfile.password);

            await contract.methods
                .updateDoctor(
                    editableProfile.fullName,
                    editableProfile.username,
                    hashedPassword, // Sử dụng mật khẩu đã mã hóa
                    editableProfile.dateOfBirth,
                    editableProfile.contactAddress,
                    editableProfile.phoneNumber,
                    editableProfile.email,
                    editableProfile.specialization,
                    editableProfile.qualifications,
                    editableProfile.workExperience,
                    editableProfile.profilePictureCID,
                    editableProfile.introduction
                )
                .send({ from: accounts[0], gas: 3000000 });

            alert("Cập nhật hồ sơ thành công!");
            setIsEditing(false);

            // Điều hướng đến trang hồ sơ sau khi cập nhật thành công
            navigate(`/profileDoctor/${editableProfile.username}`);
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ:", error);
            alert("Không thể cập nhật hồ sơ.");
        }
    };

    return (
        <div>
            <h1>Cập Nhật Hồ Sơ Bác Sĩ</h1>
            {profile && !isEditing ? (
                <div>
                    <p><strong>Họ tên:</strong> {profile.fullName}</p>
                    <p><strong>Tên người dùng:</strong> {profile.username}</p>
                    <p><strong>Ngày sinh:</strong> {profile.dateOfBirth}</p>
                    <p><strong>Địa chỉ liên hệ:</strong> {profile.contactAddress}</p>
                    <p><strong>Số điện thoại:</strong> {profile.phoneNumber}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Chuyên khoa:</strong> {profile.specialization}</p>
                    <p><strong>Bằng cấp:</strong> {profile.qualifications}</p>
                    <p><strong>Kinh nghiệm làm việc:</strong> {profile.workExperience}</p>
                    <p><strong>Giới thiệu:</strong> {profile.introduction}</p>
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="Ảnh đại diện"
                            style={{ width: '90%' }}
                        />
                    )}
                    <button onClick={() => setIsEditing(true)}>Cập nhật hồ sơ</button>
                </div>
            ) : (
                isEditing && (
                    <form onSubmit={handleUpdateProfile}>
                        <input
                            type="text"
                            name="fullName"
                            value={editableProfile?.fullName || ""}
                            onChange={handleChange}
                            placeholder="Họ tên"
                        />
                        <input
                            type="password"
                            name="password"
                            value={editableProfile?.password || ""}
                            onChange={handleChange}
                            placeholder="Mật khẩu"
                        />
                        <input
                            type="text"
                            name="dateOfBirth"
                            value={editableProfile?.dateOfBirth || ""}
                            onChange={handleChange}
                            placeholder="Ngày sinh"
                        />
                        <input
                            type="text"
                            name="contactAddress"
                            value={editableProfile?.contactAddress || ""}
                            onChange={handleChange}
                            placeholder="Địa chỉ liên hệ"
                        />
                        <input
                            type="text"
                            name="phoneNumber"
                            value={editableProfile?.phoneNumber || ""}
                            onChange={handleChange}
                            placeholder="Số điện thoại"
                        />
                        <input
                            type="text"
                            name="email"
                            value={editableProfile?.email || ""}
                            onChange={handleChange}
                            placeholder="Email"
                        />
                        <input
                            type="text"
                            name="specialization"
                            value={editableProfile?.specialization || ""}
                            onChange={handleChange}
                            placeholder="Chuyên khoa"
                        />
                        <input
                            type="text"
                            name="qualifications"
                            value={editableProfile?.qualifications || ""}
                            onChange={handleChange}
                            placeholder="Bằng cấp"
                        />
                        <input
                            type="text"
                            name="workExperience"
                            value={editableProfile?.workExperience || ""}
                            onChange={handleChange}
                            placeholder="Kinh nghiệm làm việc"
                        />
                        <input
                            type="text"
                            name="introduction"
                            value={editableProfile?.introduction || ""}
                            onChange={handleChange}
                            placeholder="Giới thiệu"
                        />
                        <input type="file" onChange={handleFileChange} />
                        <button type="button" onClick={handleUploadToPinata}>Tải ảnh lên</button>
                        <button type="submit">Cập nhật</button>
                        <button type="button" onClick={() => setIsEditing(false)}>Hủy</button>
                    </form>
                )
            )}
        </div>
    );
}

export default UpdateDoctor;
