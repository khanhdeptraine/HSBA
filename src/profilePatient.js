import React, { useState, useEffect } from "react";
import getWeb3 from "./getWeb3";
import { useParams, useNavigate } from "react-router-dom";
import patientContract from "./contracts/AddPatientRecord.json"; // ABI of the patient record contract
import axios from "axios";

function ProfilePatient() {
    const { patientAddress } = useParams(); // Lấy địa chỉ bệnh nhân từ URL
    const [contract, setContract] = useState(null);
    const [record, setRecord] = useState(null);
    const [editableRecord, setEditableRecord] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [file, setFile] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
    const [accounts, setAccounts] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            try {
                const web3 = await getWeb3();
                const networkId = await web3.eth.net.getId();
                const deployedNetwork = patientContract.networks[networkId];
                const contractInstance = new web3.eth.Contract(
                    patientContract.abi,
                    deployedNetwork && deployedNetwork.address
                );

                setContract(contractInstance);
                const accounts = await web3.eth.getAccounts();
                setAccounts(accounts);

                if (patientAddress) {
                    const result = await contractInstance.methods.getRecord(patientAddress).call();
                    const recordData = {
                        fullName: result[0],
                        dateOfBirth: result[1],
                        hometown: result[2],
                        occupation: result[3],
                        cccd: result[4],
                        healthInsuranceNumber: result[5],
                        admissionDateTime: result[6],
                        mriOrXrayCIDs: result[7],
                        diagnosis: result[8],
                        medicalHistory: result[9],
                        conclusion: result[10]
                    };
                    setRecord(recordData);
                    setEditableRecord(recordData);

                    // Cập nhật danh sách ảnh từ CID
                    if (result[7].length > 0) {
                        const urls = result[7].map(cid => `https://gateway.pinata.cloud/ipfs/${cid}`);
                        setImageUrls(urls);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi kết nối với blockchain:", error);
            }
        };

        init();
    }, [patientAddress]);

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
            setImageUrls([...imageUrls, ipfsUrl]);
            setEditableRecord((prevState) => ({
                ...prevState,
                mriOrXrayCIDs: [...prevState.mriOrXrayCIDs, res.data.IpfsHash]
            }));
            alert("Tải ảnh lên thành công!");
        } catch (error) {
            console.error("Lỗi khi tải ảnh lên:", error);
            alert("Không thể tải ảnh lên.");
        }
    };

    const handleChange = (e) => {
        setEditableRecord({
            ...editableRecord,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateRecord = async (e) => {
        e.preventDefault();

        try {
            await contract.methods
                .addRecord(
                    editableRecord.fullName,
                    editableRecord.dateOfBirth,
                    editableRecord.hometown,
                    editableRecord.occupation,
                    editableRecord.cccd,
                    editableRecord.healthInsuranceNumber,
                    editableRecord.admissionDateTime,
                    editableRecord.mriOrXrayCIDs,
                    editableRecord.diagnosis,
                    editableRecord.medicalHistory,
                    editableRecord.conclusion
                )
                .send({ from: accounts[0], gas: 3000000 });

            alert("Cập nhật hồ sơ thành công!");
            setIsEditing(false);
            navigate(`/profilePatient/${patientAddress}`);
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ:", error);
            alert("Không thể cập nhật hồ sơ.");
        }
    };

    return (
        <div>
            <h1>Hồ Sơ Bệnh Nhân</h1>
            {record && !isEditing ? (
                <div>
                    <p><strong>Họ tên:</strong> {record.fullName}</p>
                    <p><strong>Ngày sinh:</strong> {record.dateOfBirth}</p>
                    <p><strong>Quê quán:</strong> {record.hometown}</p>
                    <p><strong>Nghề nghiệp:</strong> {record.occupation}</p>
                    <p><strong>Số CCCD:</strong> {record.cccd}</p>
                    <p><strong>Số bảo hiểm y tế:</strong> {record.healthInsuranceNumber}</p>
                    <p><strong>Ngày nhập viện:</strong> {record.admissionDateTime}</p>
                    {imageUrls.length > 0 ? (
                        imageUrls.map((url, index) => (
                            <div key={index}>
                                <img src={url} alt="MRI or X-ray" style={{ width: '20%' }} />
                            </div>
                        ))
                    ) : (
                        <p>Chưa có ảnh MRI hoặc X-ray</p>
                    )}
                    <p><strong>Chẩn đoán:</strong> {record.diagnosis}</p>
                    <p><strong>Tiền sử bệnh:</strong> {record.medicalHistory}</p>
                    <p><strong>Kết luận:</strong> {record.conclusion}</p>
                    <button onClick={() => setIsEditing(true)}>Cập nhật hồ sơ</button>
                </div>
            ) : (
                isEditing && (
                    <form onSubmit={handleUpdateRecord}>
                        <input
                            type="text"
                            name="fullName"
                            value={editableRecord?.fullName || ""}
                            onChange={handleChange}
                            placeholder="Họ tên"
                        />
                        <input
                            type="text"
                            name="dateOfBirth"
                            value={editableRecord?.dateOfBirth || ""}
                            onChange={handleChange}
                            placeholder="Ngày sinh"
                        />
                        <input
                            type="text"
                            name="hometown"
                            value={editableRecord?.hometown || ""}
                            onChange={handleChange}
                            placeholder="Quê quán"
                        />
                        <input
                            type="text"
                            name="occupation"
                            value={editableRecord?.occupation || ""}
                            onChange={handleChange}
                            placeholder="Nghề nghiệp"
                        />
                        <input
                            type="text"
                            name="cccd"
                            value={editableRecord?.cccd || ""}
                            onChange={handleChange}
                            placeholder="CCCD"
                        />
                        <input
                            type="text"
                            name="healthInsuranceNumber"
                            value={editableRecord?.healthInsuranceNumber || ""}
                            onChange={handleChange}
                            placeholder="Số bảo hiểm y tế"
                        />
                        <input
                            type="text"
                            name="admissionDateTime"
                            value={editableRecord?.admissionDateTime || ""}
                            onChange={handleChange}
                            placeholder="Ngày nhập viện"
                        />
                        <input
                            type="text"
                            name="diagnosis"
                            value={editableRecord?.diagnosis || ""}
                            onChange={handleChange}
                            placeholder="Chẩn đoán"
                        />
                        <input
                            type="text"
                            name="medicalHistory"
                            value={editableRecord?.medicalHistory || ""}
                            onChange={handleChange}
                            placeholder="Tiền sử bệnh"
                        />
                        <input
                            type="text"
                            name="conclusion"
                            value={editableRecord?.conclusion || ""}
                            onChange={handleChange}
                            placeholder="Kết luận"
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

export default ProfilePatient;
